const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(bodyParser.json());

// Initialize SQLite DB for members
const DB_PATH = path.resolve(__dirname, 'lspp.db');
const db = new sqlite3.Database(DB_PATH);
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    display_name TEXT,
    location TEXT,
    type TEXT,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created INTEGER
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER,
    name TEXT,
    email TEXT,
    display_name TEXT,
    type TEXT,
    joined INTEGER
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stripe_id TEXT,
    amount INTEGER,
    currency TEXT,
    member_id INTEGER,
    created INTEGER
  )`);
});

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = process.env.TWILIO_FROM;

if(!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM){
  console.warn('Twilio env vars not set — /send will not work until TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_FROM are configured');
}

const client = (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) ? require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) : null;
const STRIPE_SECRET = process.env.STRIPE_SECRET || '';
const stripe = STRIPE_SECRET ? require('stripe')(STRIPE_SECRET) : null;

// POST /send { to: "+1314..", path: "docs/job_example.txt" }
app.post('/send', async (req, res) => {
  try{
    const { to, path: filePath } = req.body;
    if(!to || !filePath) return res.status(400).json({ error: 'to and path required' });
    const abs = path.resolve(process.cwd(), filePath);
    if(!fs.existsSync(abs)) return res.status(404).json({ error: 'file not found' });
    const body = fs.readFileSync(abs, 'utf8');
    if(!client) return res.status(500).json({ error: 'server Twilio client not configured' });
    const msg = await client.messages.create({ body, from: TWILIO_FROM, to });
    return res.json({ sid: msg.sid, status: msg.status });
  }catch(err){
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /track { provider, ts, path }
app.post('/track', (req, res) => {
  try{
    const ev = req.body;
    if(!ev || !ev.provider) return res.status(400).json({ error: 'provider required' });
    const storeFile = path.resolve(__dirname, 'tracks.json');
    let arr = [];
    try{ arr = JSON.parse(fs.readFileSync(storeFile, 'utf8') || '[]'); }catch(e){ arr = []; }
    arr.push(ev);
    fs.writeFileSync(storeFile, JSON.stringify(arr, null, 2));
    return res.json({ ok: true, count: arr.length });
  }catch(err){ console.error(err); return res.status(500).json({ error: err.message }); }
});

// POST /apply — receive a membership application
app.post('/apply', (req, res) => {
  try{
    const { name, email, display_name, location, type } = req.body || {};
    if(!email || !name) return res.status(400).json({ error: 'name and email required' });
    const stmt = db.prepare('INSERT INTO applications (name,email,display_name,location,type,created) VALUES (?,?,?,?,?,?)');
    const now = Date.now();
    stmt.run(name, email, display_name||'', location||'', type||'supporter', now, function(err){
      if(err) return res.status(500).json({ error: err.message });
      res.json({ ok: true, id: this.lastID });
    });
  }catch(err){ console.error(err); res.status(500).json({ error: err.message }); }
});

// GET /admin/applications — list applications (simple, no auth here; add auth for production)
app.get('/admin/applications', (req, res) => {
  db.all('SELECT * FROM applications ORDER BY created DESC LIMIT 500', [], (err, rows) => {
    if(err) return res.status(500).json({ error: err.message });
    res.json({ applications: rows });
  });
});

// POST /admin/applications/:id/approve — mark approved or rejected
app.post('/admin/applications/:id/approve', (req, res) => {
  const id = req.params.id;
  const { status, notes } = req.body || {};
  if(!status || !['approved','rejected'].includes(status)) return res.status(400).json({ error: 'status must be approved or rejected' });
  db.run('UPDATE applications SET status = ?, notes = ? WHERE id = ?', [status, notes||'', id], function(err){
    if(err) return res.status(500).json({ error: err.message });
    // If approved, create a member row
    if(status === 'approved'){
      db.get('SELECT * FROM applications WHERE id = ?', [id], (e, row) => {
        if(e || !row) return res.json({ ok: true, changes: this.changes });
        const now = Date.now();
        db.run('INSERT INTO members (application_id,name,email,display_name,type,joined) VALUES (?,?,?,?,?,?)', [id,row.name,row.email,row.display_name,row.type,now], function(err2){
          if(err2) console.error('Failed to create member row', err2);
          return res.json({ ok: true, changes: this.changes });
        });
      });
    }else{
      res.json({ ok: true, changes: this.changes });
    }
  });
});

// Simple token-based admin auth middleware
function requireAdmin(req,res,next){
  // Support ADMIN_TOKEN or Basic auth (ADMIN_USER/ADMIN_PASS)
  const token = req.headers['x-admin-token'] || req.query.admin_token || '';
  if(token && process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN) return next();
  // Basic auth
  const auth = (req.headers.authorization || '');
  if(auth.startsWith('Basic ') && process.env.ADMIN_USER && process.env.ADMIN_PASS){
    const b = Buffer.from(auth.split(' ')[1],'base64').toString();
    const [u,p] = b.split(':');
    if(u === process.env.ADMIN_USER && p === process.env.ADMIN_PASS) return next();
  }
  return res.status(401).json({ error: 'admin auth required' });
}

// File uploads (for validation docs)
const multer = require('multer');
const upload = multer({ dest: path.resolve(__dirname,'uploads') });
app.post('/upload-verification', upload.single('file'), (req,res)=>{
  try{
    const file = req.file;
    if(!file) return res.status(400).json({ error: 'file required' });
    // Store filename in application notes for manual review (caller should pass application_id)
    const appId = req.body.application_id;
    if(appId){ db.run('UPDATE applications SET notes = COALESCE(notes,"") || ? WHERE id = ?', [`\nUPLOAD:${file.filename}`, appId]); }
    res.json({ ok: true, file: file.filename });
  }catch(err){ console.error(err); res.status(500).json({ error: err.message }); }
});

// Admin-protected route: list members
app.get('/admin/members', requireAdmin, (req,res)=>{
  db.all('SELECT * FROM members ORDER BY joined DESC LIMIT 1000', [], (err,rows)=>{
    if(err) return res.status(500).json({ error: err.message });
    res.json({ members: rows });
  });
});

// Admin-protected route: list payments
app.get('/admin/payments', requireAdmin, (req,res)=>{
  db.all('SELECT * FROM payments ORDER BY created DESC LIMIT 1000', [], (err,rows)=>{
    if(err) return res.status(500).json({ error: err.message });
    res.json({ payments: rows });
  });
});

// Admin: migrate payments from payments.json into payments table
app.post('/admin/migrate-payments', requireAdmin, (req,res)=>{
  try{
    // Accept either an inline JSON payload (array or { payments: [...] }) or fallback to server/payments.json file
    let arr = null;
    if(req.body){
      if(Array.isArray(req.body)) arr = req.body;
      else if(Array.isArray(req.body.payments)) arr = req.body.payments;
    }
    const pfile = path.resolve(__dirname,'payments.json');
    if(!arr){
      if(!fs.existsSync(pfile)) return res.status(404).json({ error: 'payments.json not found and no payload provided' });
      arr = JSON.parse(fs.readFileSync(pfile,'utf8')||'[]');
    }

    const now = Date.now();
    let attempted = arr.length;
    let inserted = 0;
    let pending = attempted;
    if(pending === 0) return res.json({ ok: true, attempted: 0, inserted: 0 });

    const finishIfDone = ()=>{
      if(--pending === 0){
        return res.json({ ok: true, attempted, inserted });
      }
    };

    arr.forEach(sess => {
      const stripeId = sess.id || sess.id || null;
      const amount = sess.amount_total || sess.amount || null;
      const currency = sess.currency || (sess.amount_currency||null);
      const metadata = (sess.metadata && typeof sess.metadata === 'object') ? sess.metadata : {};
      const email = metadata.customer_email || metadata.email || null;
      const created = now;
      const insertRow = (memberId)=>{
        db.run('INSERT INTO payments (stripe_id,amount,currency,member_id,created) VALUES (?,?,?,?,?)',[stripeId,amount,currency,memberId,created], function(err2){
          if(!err2) inserted++;
          finishIfDone();
        });
      };

      if(email){
        db.get('SELECT id FROM members WHERE email = ? LIMIT 1', [email], (err,row)=>{
          const memberId = (row && row.id) ? row.id : null;
          insertRow(memberId);
        });
      }else{
        insertRow(null);
      }
    });
  }catch(err){ console.error(err); return res.status(500).json({ error: err.message }); }
});

// ---- Automated migration helpers ----
function exportPaymentsCSV(outPath){
  const outDir = path.dirname(outPath);
  try{ fs.mkdirSync(outDir, { recursive: true }); }catch(e){}
  db.all('SELECT * FROM payments ORDER BY created DESC', [], (err,rows)=>{
    if(err){ console.error('Export payments failed', err && err.message); return; }
    const header = 'id,stripe_id,amount,currency,member_id,created\n';
    const lines = rows.map(r=>`${r.id},${r.stripe_id||''},${r.amount||''},${r.currency||''},${r.member_id||''},${r.created||''}`).join('\n');
    fs.writeFileSync(outPath, header + lines + (lines? '\n':''));
    console.log('Exported payments CSV to', outPath);
  });
}

function exportMembersCSV(outPath){
  const outDir = path.dirname(outPath);
  try{ fs.mkdirSync(outDir, { recursive: true }); }catch(e){}
  db.all('SELECT * FROM members ORDER BY joined DESC', [], (err,rows)=>{
    if(err){ console.error('Export members failed', err && err.message); return; }
    const header = 'id,name,email,display_name,type,joined\n';
    const lines = rows.map(r=>`${r.id},"${(r.name||'').replace(/"/g,'""')}","${(r.email||'').replace(/"/g,'""')}","${(r.display_name||'').replace(/"/g,'""')}",${r.type||''},${r.joined}`).join('\n');
    fs.writeFileSync(outPath, header + lines + (lines? '\n':''));
    console.log('Exported members CSV to', outPath);
  });
}

let _autoMigrating = false;
function migrateArrayWithDedupe(arr, cb){
  if(!Array.isArray(arr)) return cb && cb(new Error('invalid payload'));
  if(_autoMigrating) return cb && cb(null, { ok: false, message: 'migration already running' });
  _autoMigrating = true;
  let attempted = arr.length; let inserted = 0; let pending = attempted;
  if(pending === 0){ _autoMigrating=false; return cb && cb(null, { ok:true, attempted:0, inserted:0 }); }
  const now = Date.now();
  arr.forEach(sess => {
    const stripeId = sess.id || sess.id || null;
    const amount = sess.amount_total || sess.amount || null;
    const currency = sess.currency || (sess.amount_currency||null) || 'USD';
    const metadata = (sess.metadata && typeof sess.metadata === 'object') ? sess.metadata : {};
    const email = metadata.customer_email || metadata.email || null;

    // dedupe by stripe_id (txn id)
    if(!stripeId){
      // still insert anonymous rows
      db.run('INSERT INTO payments (stripe_id,amount,currency,member_id,created) VALUES (?,?,?,?,?)',[null,amount,currency,null,now], function(err){ if(!err) inserted++; if(--pending===0){ _autoMigrating=false; exportPaymentsCSV(path.resolve(__dirname,'exports','payments.csv')); exportMembersCSV(path.resolve(__dirname,'exports','members.csv')); cb && cb(null,{ok:true,attempted,inserted}); } });
      return;
    }
    db.get('SELECT id FROM payments WHERE stripe_id = ? LIMIT 1', [stripeId], (err,row)=>{
      if(err){ console.error('Dedup check failed', err && err.message); }
      if(row && row.id){
        // already present, skip
        if(--pending===0){ _autoMigrating=false; exportPaymentsCSV(path.resolve(__dirname,'exports','payments.csv')); exportMembersCSV(path.resolve(__dirname,'exports','members.csv')); cb && cb(null,{ok:true,attempted,inserted}); }
      }else{
        // find member id if possible
        if(email){
          db.get('SELECT id FROM members WHERE email = ? LIMIT 1', [email], (e,mrow)=>{
            const memberId = (mrow && mrow.id)? mrow.id : null;
            db.run('INSERT INTO payments (stripe_id,amount,currency,member_id,created) VALUES (?,?,?,?,?)',[stripeId,amount,currency,memberId,now], function(err2){ if(!err2) inserted++; if(--pending===0){ _autoMigrating=false; exportPaymentsCSV(path.resolve(__dirname,'exports','payments.csv')); exportMembersCSV(path.resolve(__dirname,'exports','members.csv')); cb && cb(null,{ok:true,attempted,inserted}); } });
          });
        }else{
          db.run('INSERT INTO payments (stripe_id,amount,currency,member_id,created) VALUES (?,?,?,?,?)',[stripeId,amount,currency,null,now], function(err2){ if(!err2) inserted++; if(--pending===0){ _autoMigrating=false; exportPaymentsCSV(path.resolve(__dirname,'exports','payments.csv')); exportMembersCSV(path.resolve(__dirname,'exports','members.csv')); cb && cb(null,{ok:true,attempted,inserted}); } });
        }
      }
    });
  });
}

function migrateFromFile(cb){
  const pfile = path.resolve(__dirname,'payments.json');
  if(!fs.existsSync(pfile)) return cb && cb(null,{ ok:false, message:'payments.json missing' });
  let arr = [];
  try{ arr = JSON.parse(fs.readFileSync(pfile,'utf8')||'[]'); }catch(e){ return cb && cb(e); }
  migrateArrayWithDedupe(arr, cb);
}

// Auto-run migration at startup if payments.json exists
try{ if(fs.existsSync(path.resolve(__dirname,'payments.json'))){ console.log('payments.json present at startup — auto-migrating'); migrateFromFile((err,res)=>{ if(err) console.error('Auto-migrate error', err && err.message); else console.log('Auto-migrate result', res); }); } }catch(e){}

// Watch payments.json for changes and auto-migrate (debounced)
try{
  const watchFile = path.resolve(__dirname,'payments.json');
  let timer = null;
  fs.watch(path.resolve(__dirname), (ev, fname)=>{
    if(!fname) return;
    if(fname.indexOf('payments.json')===-1) return;
    if(timer) clearTimeout(timer);
    timer = setTimeout(()=>{ console.log('payments.json changed — auto-migrating'); migrateFromFile((err,res)=>{ if(err) console.error('Auto-migrate error', err && err.message); else console.log('Auto-migrate result', res); }); }, 800);
  });
}catch(e){ console.error('Failed to set up payments.json watcher', e && e.message); }

// Admin: export members CSV
app.get('/admin/export/members.csv', requireAdmin, (req,res)=>{
  db.all('SELECT * FROM members ORDER BY joined DESC', [], (err,rows)=>{
    if(err) return res.status(500).send('Error');
    res.setHeader('Content-Type','text/csv');
    res.setHeader('Content-Disposition','attachment; filename="members.csv"');
    const header = 'id,name,email,display_name,type,joined\n';
    res.write(header);
    rows.forEach(r=>{
      res.write(`${r.id},"${(r.name||'').replace(/"/g,'""')}","${(r.email||'').replace(/"/g,'""')}","${(r.display_name||'').replace(/"/g,'""')}",${r.type||''},${r.joined}\n`);
    });
    res.end();
  });
});

// Admin: export payments CSV
app.get('/admin/export/payments.csv', requireAdmin, (req,res)=>{
  db.all('SELECT * FROM payments ORDER BY created DESC', [], (err,rows)=>{
    if(err) return res.status(500).send('Error');
    res.setHeader('Content-Type','text/csv');
    res.setHeader('Content-Disposition','attachment; filename="payments.csv"');
    res.write('id,stripe_id,amount,currency,member_id,created\n');
    rows.forEach(r=>{
      res.write(`${r.id},${r.stripe_id||''},${r.amount||''},${r.currency||''},${r.member_id||''},${r.created||''}\n`);
    });
    res.end();
  });
});

// Admin: record a manual Cash App payment and notify
app.post('/admin/record-cashapp', requireAdmin, (req,res)=>{
  try{
    const { amount, currency, txn_id, payer_email, note } = req.body || {};
    if(!amount || !txn_id) return res.status(400).json({ error: 'amount and txn_id required' });
    const created = Date.now();
    // insert into payments table; stripe_id stores txn_id for Cash App records
    db.run('INSERT INTO payments (stripe_id,amount,currency,member_id,created) VALUES (?,?,?,?,?)',[txn_id, parseInt(amount,10), currency||'USD', null, created], function(err){
      if(err) return res.status(500).json({ error: err.message });
      const cashLink = 'https://cash.app/$brandon314314';
      const amountDisplay = (parseInt(amount,10)/100).toFixed(2);
      const msgText = `Manual Cash App recorded: $${amountDisplay} ${currency||'USD'} (txn ${txn_id}). Reconcile with ${cashLink}`;
      // send SMS if configured
      try{
        const notifyTo = process.env.ADMIN_NOTIFY || process.env.TWILIO_TO || null;
        if(client && notifyTo){
          client.messages.create({ body: msgText, from: TWILIO_FROM, to: notifyTo })
            .then(m => console.log('Manual CashApp notification SMS sent', m.sid))
            .catch(err => console.error('Failed to send SMS notify', err && err.message));
        }
      }catch(e){ console.error('SMS notify error', e && e.message); }
      // Telegram
      try{
        const tgToken = process.env.TELEGRAM_BOT_TOKEN || '';
        const tgChat = process.env.TELEGRAM_CHAT_ID || '';
        if(tgToken && tgChat){
          const tgUrl = `https://api.telegram.org/bot${tgToken}/sendMessage`;
          const body = new URLSearchParams();
          body.append('chat_id', tgChat);
          body.append('text', msgText);
          fetch(tgUrl, { method: 'POST', body })
            .then(r => r.json()).then(j=>{ if(j && j.ok) console.log('Telegram manual notify sent'); else console.error('Telegram manual notify failed', j); })
            .catch(e=>console.error('Telegram manual notify error', e && e.message));
        }
      }catch(e){ console.error('Telegram notify error', e && e.message); }

      // append to tracks.json as fallback
      try{
        const trackFile = path.resolve(__dirname, 'tracks.json');
        let tracks = [];
        try{ tracks = JSON.parse(fs.readFileSync(trackFile,'utf8')||'[]'); }catch(e){ tracks = []; }
        tracks.push({ type: 'manual_cashapp', txn_id, amount: parseInt(amount,10), currency: currency||'USD', note: note||'', ts: Date.now() });
        fs.writeFileSync(trackFile, JSON.stringify(tracks, null, 2));
      }catch(e){ console.error('Failed to write track', e && e.message); }

      return res.json({ ok: true, id: this.lastID });
    });
  }catch(err){ console.error(err); return res.status(500).json({ error: err.message }); }
});

// POST /create-checkout { amount, currency }
app.post('/create-checkout', async (req, res) => {
  if(!stripe) return res.status(500).json({ error: 'Stripe not configured (set STRIPE_SECRET)' });
  try{
    const { amount, currency } = req.body;
    const amt = parseInt(amount, 10) || 500; // default 5.00
    const cur = (currency || 'USD').toUpperCase();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{ price_data: { currency: cur, product_data: { name: 'Support / Donation' }, unit_amount: amt }, quantity: 1 }],
      success_url: req.headers.origin + '/docs/reflection_form_improved.html?checkout=success',
      cancel_url: req.headers.origin + '/docs/reflection_form_improved.html?checkout=cancel'
    });
    res.json({ url: session.url });
  }catch(err){ console.error(err); res.status(500).json({ error: err.message }); }
});

// Stripe webhook endpoint: POST /webhook
// If STRIPE_WEBHOOK_SECRET is set, the raw body is verified.
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  try{
    let event;
    if(stripe && process.env.STRIPE_WEBHOOK_SECRET){
      const sig = req.headers['stripe-signature'];
      try{
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
      }catch(err){
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    }else{
      // No webhook secret configured — parse body as JSON (less secure)
      try{ event = JSON.parse(req.body.toString()); }catch(e){ return res.status(400).send('Invalid JSON'); }
    }

    // Handle checkout.session.completed
    if(event && event.type === 'checkout.session.completed'){
      const session = event.data.object;
      const record = {
        id: session.id,
        amount_total: session.amount_total || null,
        currency: session.currency || null,
        customer: session.customer || null,
        metadata: session.metadata || {},
        created: Date.now()
      };
      const storeFile = path.resolve(__dirname, 'payments.json');
      let arr = [];
      try{ arr = JSON.parse(fs.readFileSync(storeFile, 'utf8') || '[]'); }catch(e){ arr = []; }
      arr.push(record);
      fs.writeFileSync(storeFile, JSON.stringify(arr, null, 2));
      console.log('Recorded payment', record.id);

      // Prepare notification message including Cash App link
      const cashLink = 'https://cash.app/$brandon314314';
      const amountDisplay = record.amount_total ? (record.amount_total/100).toFixed(2) : 'unknown';
      const msgText = `Payment received: $${amountDisplay} ${record.currency || ''} (session ${record.id}). Reconcile or forward to Cash App: ${cashLink}`;

      // Send SMS via Twilio if configured
      try{
        const notifyTo = process.env.ADMIN_NOTIFY || process.env.TWILIO_TO || null;
        if(client && notifyTo){
          client.messages.create({ body: msgText, from: TWILIO_FROM, to: notifyTo })
            .then(m => console.log('Notification SMS sent', m.sid))
            .catch(err => console.error('Failed to send SMS notification', err && err.message));
        }
      }catch(err){ console.error('SMS notify error', err && err.message); }

      // Send Telegram message if configured
      try{
        const tgToken = process.env.TELEGRAM_BOT_TOKEN || '';
        const tgChat = process.env.TELEGRAM_CHAT_ID || '';
        if(tgToken && tgChat){
          const tgUrl = `https://api.telegram.org/bot${tgToken}/sendMessage`;
          const body = new URLSearchParams();
          body.append('chat_id', tgChat);
          body.append('text', msgText);
          // fire and forget using global fetch (Node 18+)
          fetch(tgUrl, { method: 'POST', body })
            .then(r => r.json())
            .then(j => { if(j && j.ok) console.log('Telegram notification sent'); else console.error('Telegram notify failed', j); })
            .catch(e => console.error('Telegram notify error', e && e.message));
        }
      }catch(err){ console.error('Telegram notify error', err && err.message); }

      // If no remote notify, append notification to tracks.json for manual review
      try{
        const trackFile = path.resolve(__dirname, 'tracks.json');
        let tracks = [];
        try{ tracks = JSON.parse(fs.readFileSync(trackFile,'utf8')||'[]'); }catch(e){ tracks = []; }
        tracks.push({ type: 'payment_notification', msg: msgText, ts: Date.now() });
        fs.writeFileSync(trackFile, JSON.stringify(tracks, null, 2));
      }catch(e){ console.error('Failed to write track notification', e && e.message); }
    }

    res.json({ received: true });
  }catch(err){ console.error(err); res.status(500).json({ error: err.message }); }
});

const port = process.env.PORT || 3000;
app.listen(port, ()=> console.log('Server listening on', port));
