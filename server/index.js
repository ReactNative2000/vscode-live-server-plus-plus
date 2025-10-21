const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());

// Initialize SQLite DB for members
const DB_PATH = path.resolve(__dirname, 'lspp.db');
const db = new sqlite3.Database(DB_PATH);

// Crypto helpers for optional token encryption (AES-256-GCM)
const ORCID_TOKEN_KEY = process.env.ORCID_TOKEN_KEY || null; // expected base64 or raw
function getKey(){
  if(!ORCID_TOKEN_KEY) return null;
  try{ return Buffer.from(ORCID_TOKEN_KEY, 'base64'); }catch(e){ return Buffer.from(String(ORCID_TOKEN_KEY)); }
}
function encryptToken(plain){
  const key = getKey(); if(!key) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}
function decryptToken(blob){
  const key = getKey(); if(!key || !blob) return null;
  const data = Buffer.from(blob, 'base64');
  const iv = data.slice(0,12);
  const tag = data.slice(12,28);
  const encrypted = data.slice(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return dec.toString('utf8');
}
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
  // ensure refunded column exists (add if missing)
  db.get("PRAGMA table_info('payments')", [], (err, row) => {
    // we'll inspect columns later via PRAGMA; add refunded column if not present
    db.all("PRAGMA table_info('payments')", [], (e, cols) => {
      if(!e && Array.isArray(cols)){
        const hasRefunded = cols.find(c => c.name === 'refunded');
        if(!hasRefunded){
          try{ db.run('ALTER TABLE payments ADD COLUMN refunded INTEGER DEFAULT 0'); }catch(ex){ /* ignore */ }
        }
      }
    });
  });
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    provider TEXT,
    label TEXT,
    href TEXT,
    path TEXT,
    ts INTEGER,
    ua TEXT,
    raw TEXT,
    created INTEGER
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS scheduled_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    who TEXT,
    amount INTEGER,
    run_at INTEGER,
    processed INTEGER DEFAULT 0,
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
const nodemailer = require('nodemailer');

// Optional Sentry for error reporting (set SENTRY_DSN in env to enable)
let sentry = null;
if(process.env.SENTRY_DSN){
  try{
    const Sentry = require('@sentry/node');
    Sentry.init({ dsn: process.env.SENTRY_DSN });
    sentry = Sentry;
    console.log('Sentry initialized');
  }catch(e){ console.warn('Sentry not installed or failed to initialize', e && e.message); }
}

// Health endpoint: checks server and DB connectivity
app.get('/health', (req, res) => {
  // check DB
  db.get('SELECT 1 AS ok', [], (err) => {
    if(err) return res.status(500).json({ ok: false, db: false, error: err.message });
    res.json({ ok: true, db: true, uptime: process.uptime() });
  });
});

// Simple metrics endpoint
app.get('/metrics', (req, res) => {
  db.get('SELECT COUNT(*) as payments FROM payments', [], (err,row) => {
    const payments = (row && row.payments) ? row.payments : (row && row['COUNT(*)']) ? row['COUNT(*)'] : 0;
    res.json({ uptime: process.uptime(), payments: payments });
  });
});

// setup a nodemailer transporter if SMTP env vars are present (optional)
let mailer = null;
if(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS){
  mailer = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: parseInt(process.env.SMTP_PORT||587,10), secure: process.env.SMTP_SECURE === '1', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
}

// Load centralized cash config (falls back to embedded default)
let cashConfig = { cashtag: '$brandon314314', utm: { source: 'repo', medium: 'docs', campaign: 'support' } };
try{
  const cfgPath = path.resolve(__dirname, '..', 'config', 'cash.json');
  if(fs.existsSync(cfgPath)){
    const raw = fs.readFileSync(cfgPath, 'utf8');
    const parsed = JSON.parse(raw || '{}');
    if(parsed && parsed.cashtag) cashConfig.cashtag = parsed.cashtag;
    if(parsed && parsed.utm) cashConfig.utm = parsed.utm;
  }
}catch(e){ console.warn('Failed to load cash config', e && e.message); }

// Helper to build a safe Cash App link from the configured cashtag
function buildCashLink(){
  const raw = (cashConfig && cashConfig.cashtag) ? String(cashConfig.cashtag) : '$brandon314314';
  const plain = raw.replace(/^\$/,'');
  return `https://cash.app/${encodeURIComponent(plain)}`;
}

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
    // also persist into SQLite events table for long-term storage
    try{
      const now = Date.now();
      const stmt = db.prepare('INSERT INTO events (type,provider,label,href,path,ts,ua,raw,created) VALUES (?,?,?,?,?,?,?,?,?)');
      const raw = JSON.stringify(ev || {});
      stmt.run(ev.type||ev.event||'ui_event', ev.provider||null, ev.label||null, ev.href||null, ev.path||null, ev.ts||now, (ev.ua||req.headers['user-agent']||''), raw, now);
      stmt.finalize();
    }catch(e){ console.error('Failed to persist event to DB', e && e.message); }
    return res.json({ ok: true, count: arr.length });
  }catch(err){ console.error(err); return res.status(500).json({ error: err.message }); }
});

// Admin-protected route: list events
app.get('/admin/events', requireAdmin, (req, res) => {
  const limit = parseInt(req.query.limit || '500', 10);
  db.all('SELECT * FROM events ORDER BY created DESC LIMIT ?', [limit], (err, rows) => {
    if(err) return res.status(500).json({ error: err.message });
    res.json({ events: rows });
  });
});

// Admin export CSV for events
app.get('/admin/export/events.csv', requireAdmin, (req, res) => {
  db.all('SELECT * FROM events ORDER BY created DESC', [], (err, rows) => {
    if(err) return res.status(500).send('error: ' + err.message);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="events.csv"');
    // header
    res.write('id,type,provider,label,href,path,ts,ua,created\n');
    rows.forEach(r => {
      // naive CSV escaping
      const esc = v => '"' + String(v || '').replace(/"/g,'""') + '"';
      res.write([r.id, r.type, r.provider, r.label, r.href, r.path, r.ts, r.ua, r.created].map(esc).join(',') + '\n');
    });
    res.end();
  });
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
      const cashLink = buildCashLink();
      db.get('SELECT * FROM applications WHERE id = ?', [id], (e, row) => {
        if(e || !row) return res.json({ ok: true, changes: this.changes });
        const now = Date.now();
        db.run('INSERT INTO members (application_id,name,email,display_name,type,joined) VALUES (?,?,?,?,?,?)', [id,row.name,row.email,row.display_name,row.type,now], function(err2){
          if(err2) console.error('Failed to create member row', err2);
          return res.json({ ok: true, changes: this.changes });
        });
      });
    } else {
      res.json({ ok: true, changes: this.changes });
    }
  });
});

// Simple token-based admin auth middleware
function requireAdmin(req,res,next){
  // Prefer Authorization header (Bearer token or Basic). Keep x-admin-token and query param as legacy fallbacks.
  const authHeader = (req.headers.authorization || '');
  // Bearer token
  if(authHeader.startsWith('Bearer ') && process.env.ADMIN_TOKEN){
    const t = authHeader.slice(7).trim();
    if(t && t === process.env.ADMIN_TOKEN) return next();
  }
  // Basic auth
  if(authHeader.startsWith('Basic ') && process.env.ADMIN_USER && process.env.ADMIN_PASS){
    try{
      const b = Buffer.from(authHeader.split(' ')[1],'base64').toString();
      const [u,p] = b.split(':');
      if(u === process.env.ADMIN_USER && p === process.env.ADMIN_PASS) return next();
    }catch(e){ /* ignore */ }
  }
  // legacy header
  const legacyX = req.headers['x-admin-token'];
  if(legacyX && process.env.ADMIN_TOKEN && legacyX === process.env.ADMIN_TOKEN) return next();
  // legacy query param (still supported but discouraged)
  const legacyQ = req.query.admin_token || '';
  if(legacyQ && process.env.ADMIN_TOKEN && legacyQ === process.env.ADMIN_TOKEN){
    console.warn('Using admin token via query string; consider switching to Authorization: Bearer <token>');
    return next();
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

// POST /admin/reconcile { payment_id, application_id }
app.post('/admin/reconcile', requireAdmin, (req,res)=>{
  try{
    const { payment_id, application_id } = req.body || {};
    if(!payment_id || !application_id) return res.status(400).json({ error: 'payment_id and application_id required' });
    // find member for application
    db.get('SELECT id FROM members WHERE application_id = ? LIMIT 1', [application_id], (err,mrow)=>{
      if(err) return res.status(500).json({ error: err.message });
      const memberId = (mrow && mrow.id) ? mrow.id : null;
      db.run('UPDATE payments SET member_id = ? WHERE id = ?', [memberId, payment_id], function(e2){
        if(e2) return res.status(500).json({ error: e2.message });
        return res.json({ ok: true, changes: this.changes });
      });
    });
  }catch(err){ console.error(err); res.status(500).json({ error: err.message }); }
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

// Admin: schedule a gift (simple scheduler)
app.post('/admin/schedule-gift', requireAdmin, (req, res) => {
  try{
    const { who, amount, run_at } = req.body || {};
    if(!who || !amount || !run_at) return res.status(400).json({ error: 'who, amount, run_at required' });
    const now = Date.now();
    db.run('INSERT INTO scheduled_payments (who,amount,run_at,created) VALUES (?,?,?,?)', [who, parseInt(amount,10), parseInt(run_at,10), now], function(err){
      if(err) return res.status(500).json({ error: err.message });
      return res.json({ ok: true, id: this.lastID });
    });
  }catch(e){ console.error(e); return res.status(500).json({ error: e.message }); }
});

// Admin: ledger CSV (payments, include refunded flag)
app.get('/admin/ledger.csv', requireAdmin, (req,res)=>{
  db.all('SELECT * FROM payments ORDER BY created DESC', [], (err, rows)=>{
    if(err) return res.status(500).send('Error');
    res.setHeader('Content-Type','text/csv');
    res.setHeader('Content-Disposition','attachment; filename="ledger.csv"');
    res.write('id,stripe_id,amount,currency,member_id,created,refunded\n');
    rows.forEach(r=>{
      res.write(`${r.id},${r.stripe_id||''},${r.amount||''},${r.currency||''},${r.member_id||''},${r.created||''},${r.refunded||0}\n`);
    });
    res.end();
  });
});

// Admin: refund (mark payment as refunded)
app.post('/admin/refund/:id', requireAdmin, (req, res) => {
  const id = req.params.id;
  db.run('UPDATE payments SET refunded = 1 WHERE id = ?', [id], function(err){
    if(err) return res.status(500).json({ error: err.message });
    return res.json({ ok: true, changes: this.changes });
  });
});

// Admin: create a playful payment from a named persona (god/satan/man)
app.post('/admin/pay-from/:who', requireAdmin, (req, res) => {
  try{
    const who = req.params.who;
    const amount = parseInt(req.body && req.body.amount ? req.body.amount : (req.query.amount || '500'), 10);
    const stripeId = `${who}-${Date.now()}`;
    const created = Date.now();
    db.run('INSERT INTO payments (stripe_id,amount,currency,member_id,created) VALUES (?,?,?,?,?)', [stripeId, amount || 0, 'USD', null, created], function(err){
      if(err) return res.status(500).json({ error: err.message });
      return res.json({ ok: true, id: this.lastID, stripe_id: stripeId });
    });
  }catch(e){ console.error(e); return res.status(500).json({ error: e.message }); }
});

// Scheduler loop: process scheduled_payments where run_at <= now and processed = 0
setInterval(()=>{
  const now = Date.now();
  db.all('SELECT * FROM scheduled_payments WHERE processed = 0 AND run_at <= ? LIMIT 10', [now], (err, rows)=>{
    if(err || !rows || rows.length === 0) return;
    rows.forEach(r => {
      // create a payments row as a simulated payment
      const stripeId = `${r.who}-${Date.now()}`;
      db.run('INSERT INTO payments (stripe_id,amount,currency,member_id,created) VALUES (?,?,?,?,?)', [stripeId, r.amount || 0, 'USD', null, Date.now()], function(err2){
        if(err2) console.error('Failed to insert scheduled payment', err2 && err2.message);
        else console.log('Scheduled payment processed', stripeId);
      });
      db.run('UPDATE scheduled_payments SET processed = 1 WHERE id = ?', [r.id], function(e){ if(e) console.error('Failed to mark scheduled', e && e.message); });
    });
  });
}, 2000);

// Admin: record a manual Cash App payment and notify
app.post('/admin/record-cashapp', requireAdmin, (req,res)=>{
  try{
    const { amount, currency, txn_id, payer_email, note } = req.body || {};
    if(!amount || !txn_id) return res.status(400).json({ error: 'amount and txn_id required' });
    const created = Date.now();
    // insert into payments table; stripe_id stores txn_id for Cash App records
    db.run('INSERT INTO payments (stripe_id,amount,currency,member_id,created) VALUES (?,?,?,?,?)',[txn_id, parseInt(amount,10), currency||'USD', null, created], function(err){
      if(err) return res.status(500).json({ error: err.message });
  const cashLink = buildCashLink();
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
    const { amount, currency, application_id, customer_email } = req.body || {};
    const amt = parseInt(amount, 10) || 500; // default 5.00
    const cur = (currency || 'USD').toUpperCase();
    const metadata = {};
    if(application_id) metadata.application_id = String(application_id);
    if(customer_email) metadata.customer_email = String(customer_email);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{ price_data: { currency: cur, product_data: { name: 'Support / Donation' }, unit_amount: amt }, quantity: 1 }],
      success_url: req.headers.origin + '/docs/reflection_form_improved.html?checkout=success',
      cancel_url: req.headers.origin + '/docs/reflection_form_improved.html?checkout=cancel',
      metadata
    });
    res.json({ url: session.url, id: session.id });
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
      const metadata = session.metadata || {};
      const stripeId = session.id;
      const amount = session.amount_total || null;
      const currency = session.currency || null;
      const email = metadata.customer_email || session.customer_details && session.customer_details.email || null;
      const applicationId = metadata.application_id ? parseInt(metadata.application_id,10) : null;
      const createdAt = Date.now();

      // Try to find a member by email
      const insertPayment = (memberId)=>{
        db.run('INSERT INTO payments (stripe_id,amount,currency,member_id,created) VALUES (?,?,?,?,?)',[stripeId,amount,currency,memberId,createdAt], function(err){
          if(err){ console.error('Failed to persist payment', err && err.message); }
          else console.log('Persisted payment', stripeId);
          // Send email notification to admin if configured
          try{
            if(mailer && process.env.ADMIN_EMAIL){
              const amountDisplay = amount ? (amount/100).toFixed(2) : 'unknown';
              const html = `<p>Payment received: <strong>$${amountDisplay} ${currency||''}</strong></p><p>Stripe session: ${stripeId}</p><p>Member ID: ${memberId||'N/A'}</p>`;
              mailer.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: process.env.ADMIN_EMAIL, subject: `Payment received: $${amountDisplay}`, html }).then(()=>console.log('Admin email sent')).catch(e=>console.error('Failed to send admin email', e && e.message));
            }
          }catch(e){ console.error('Email notify error', e && e.message); }
        });
      };

      if(email){
        db.get('SELECT id FROM members WHERE email = ? LIMIT 1', [email], (err,row)=>{
          const memberId = (row && row.id) ? row.id : null;
          insertPayment(memberId);
        });
      }else if(applicationId){
        // find member by application -> member
        db.get('SELECT m.id FROM members m WHERE m.application_id = ? LIMIT 1', [applicationId], (err,row)=>{
          const memberId = (row && row.id) ? row.id : null;
          insertPayment(memberId);
        });
      }else{
        insertPayment(null);
      }

      // Prepare notification message including Cash App link
  const cashLink = buildCashLink();
  const amountDisplay = amount ? (amount/100).toFixed(2) : 'unknown';
  const msgText = `Payment received: $${amountDisplay} ${currency || ''} (session ${stripeId}). Reconcile or forward to Cash App: ${cashLink}`;

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

// Character endpoints (serve short Markdown/text artifacts from docs/bible)
app.get('/character/god', (req, res) => {
  try{
    const p = path.resolve(__dirname, '..', 'docs', 'bible', 'God.md');
    if(!fs.existsSync(p)) return res.status(404).json({ error: 'not found' });
    const txt = fs.readFileSync(p, 'utf8');
    return res.json({ ok: true, name: 'God', content: txt });
  }catch(e){ console.error(e); return res.status(500).json({ error: e.message }); }
});

app.get('/character/satan', (req, res) => {
  try{
    const p = path.resolve(__dirname, '..', 'docs', 'bible', 'Satan.md');
    if(!fs.existsSync(p)) return res.status(404).json({ error: 'not found' });
    const txt = fs.readFileSync(p, 'utf8');
    return res.json({ ok: true, name: 'Satan', content: txt });
  }catch(e){ console.error(e); return res.status(500).json({ error: e.message }); }
});

app.get('/character/man', (req, res) => {
  try{
    const p = path.resolve(__dirname, '..', 'docs', 'bible', 'Man.md');
    if(!fs.existsSync(p)) return res.status(404).json({ error: 'not found' });
    const txt = fs.readFileSync(p, 'utf8');
    return res.json({ ok: true, name: 'The Man', content: txt });
  }catch(e){ console.error(e); return res.status(500).json({ error: e.message }); }
});

// New vampire character endpoint
app.get('/character/vampire', (req, res) => {
  try{
    const p = path.resolve(__dirname, '..', 'docs', 'bible', 'Vampire.md');
    if(!fs.existsSync(p)) return res.status(404).json({ error: 'not found' });
    const txt = fs.readFileSync(p, 'utf8');
    return res.json({ ok: true, name: 'Vampire', content: txt });
  }catch(e){ console.error(e); return res.status(500).json({ error: e.message }); }
});

// Minimal ORCID OAuth helpers for demo/testing
app.get('/orcid/connect', (req, res) => {
  try{
    const clientId = process.env.ORCID_CLIENT_ID || 'test-client';
    const redirectUri = process.env.ORCID_REDIRECT_URI || (`http://127.0.0.1:${process.env.PORT || 3010}/orcid/callback`);
    const state = Math.random().toString(36).slice(2,10);
    const url = `https://orcid.org/oauth/authorize?client_id=${encodeURIComponent(clientId)}&response_type=code&scope=/authenticate&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;
    return res.redirect(302, url);
  }catch(e){ console.error(e); return res.status(500).json({ error: e.message }); }
});

app.get('/orcid/callback', (req, res) => {
  // For demo purposes just acknowledge the callback; a full implementation would exchange code for token
  const { code, state } = req.query || {};
  return res.json({ ok: true, code: code || null, state: state || null });
});
