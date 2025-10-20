const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
try { require('dotenv').config(); } catch (e) { /* optional */ }

let Database;
try { Database = require('better-sqlite3'); } catch (e) { console.warn('better-sqlite3 not available, falling back to JSON storage for demo'); }

const DB_PATH = path.resolve(__dirname, 'homicide.db');
const DB_JSON = path.resolve(__dirname, 'db.json');
const cors = require('cors');
const app = express();
app.use(bodyParser.json());

if (process.env.NODE_ENV !== 'production') {
  app.use(cors());
} else {
  const allowed = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  if (allowed.length) app.use(cors({ origin: allowed }));
}

function requireAdmin(req, res, next) {
  const token = process.env.ADMIN_TOKEN;
  if (!token && process.env.NODE_ENV === 'production') return res.status(401).json({ error: 'admin auth required (no token configured)' });
  if (!token) { console.warn('ADMIN_TOKEN not set; running in demo mode (admin routes are open)'); return next(); }
  const ah = req.get('authorization') || '';
  if (ah.startsWith('Bearer ')) {
    const v = ah.substr('Bearer '.length).trim();
    if (v === token) return next();
  }
  res.status(401).json({ error: 'admin auth required' });
}

function readJsonDb() {
  try {
    if (!fs.existsSync(DB_JSON)) return [];
    const raw = fs.readFileSync(DB_JSON, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) { console.error('Failed to read JSON DB', e); return []; }
}

function writeJsonDb(items) {
  try { fs.writeFileSync(DB_JSON + '.tmp', JSON.stringify(items, null, 2)); fs.renameSync(DB_JSON + '.tmp', DB_JSON); } catch (e) { console.error('Failed to write JSON DB', e); }
}

if (Database) {
  function init() {
    const db = new Database(DB_PATH);
    db.exec(`CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_no TEXT UNIQUE,
      title TEXT,
      status TEXT,
      filed_at TEXT
    );`);
    return db;
  }
  const db = init();

  app.get('/api/cases', (req, res) => {
    const rows = db.prepare('SELECT case_no,title,status,filed_at FROM cases ORDER BY case_no').all();
    res.json(rows);
  });

  app.post('/api/cases/import', requireAdmin, (req, res) => {
    const items = req.body;
    const insert = db.prepare('INSERT OR REPLACE INTO cases (case_no,title,status,filed_at) VALUES (?,?,?,?)');
    const trx = db.transaction((rows) => {
      for (const r of rows) insert.run(r.case_no, r.title, r.status || '', r.filed_at || '');
    });
    try { trx(items); res.json({ imported: items.length }); } catch (e) { res.status(500).json({ error: String(e) }); }
  });

} else {
  app.get('/api/cases', (req, res) => {
    const items = readJsonDb();
    res.json(items.map(({ case_no,title,status,filed_at }) => ({ case_no,title,status,filed_at })));
  });

  app.post('/api/cases/import', requireAdmin, (req, res) => {
    const items = req.body || [];
    const cur = readJsonDb();
    const byKey = new Map(cur.map(i => [i.case_no, i]));
    for (const it of items) byKey.set(it.case_no, Object.assign({}, it));
    const merged = Array.from(byKey.values()).sort((a,b) => (a.case_no||'').localeCompare(b.case_no||''));
    writeJsonDb(merged);
    res.json({ imported: items.length });
  });
}

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Homicide API listening on ${PORT} (storage: ${Database ? 'sqlite' : 'json'})`));
