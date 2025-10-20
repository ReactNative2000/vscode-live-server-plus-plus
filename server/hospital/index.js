const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
// load .env for local development if present
try { require('dotenv').config(); } catch (e) { /* dotenv optional */ }

let Database;
try {
  // prefer native sqlite when available
  Database = require('better-sqlite3');
} catch (e) {
  console.warn('better-sqlite3 not available, falling back to JSON storage for demo');
}

const DB_PATH = path.resolve(__dirname, 'hospital.db');
const DB_JSON = path.resolve(__dirname, 'db.json');
const cors = require('cors');
const app = express();
app.use(bodyParser.json());

// CORS policy: permissive in local/dev (allows common localhost dev ports),
// and configurable in production via ALLOWED_ORIGINS (comma-separated list).
if (process.env.NODE_ENV !== 'production') {
  app.use(cors()); // allow all origins in development for convenience
} else {
  const allowed = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  if (allowed.length) {
    app.use(cors({ origin: allowed }));
  }
}

function requireAdmin(req, res, next) {
  const token = process.env.ADMIN_TOKEN;
  // In production we require ADMIN_TOKEN to be set and valid.
  if (!token && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: 'admin auth required (no token configured)' });
  }
  if (!token) {
    // no token configured -> allow for demo but log warning
    console.warn('ADMIN_TOKEN not set; running in demo mode (admin routes are open)');
    return next();
  }
  const ah = req.get('authorization') || '';
  if (ah.startsWith('Bearer ')) {
    const v = ah.substr('Bearer '.length).trim();
    if (v === token) return next();
  }
  res.status(401).json({ error: 'admin auth required' });
}

// JSON storage helpers (atomic write)
function readJsonDb() {
  try {
    if (!fs.existsSync(DB_JSON)) return [];
    const raw = fs.readFileSync(DB_JSON, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    console.error('Failed to read JSON DB', e);
    return [];
  }
}

function writeJsonDb(items) {
  try {
    fs.writeFileSync(DB_JSON + '.tmp', JSON.stringify(items, null, 2));
    fs.renameSync(DB_JSON + '.tmp', DB_JSON);
  } catch (e) {
    console.error('Failed to write JSON DB', e);
  }
}

if (Database) {
  // SQLite-backed implementation
  function init() {
    const db = new Database(DB_PATH);
    db.exec(`CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT UNIQUE,
      name TEXT,
      category TEXT,
      quantity INTEGER,
      reorder_level INTEGER,
      location TEXT,
      supplier TEXT
    );`);
    return db;
  }

  const db = init();

  app.get('/api/items', (req, res) => {
    const rows = db.prepare('SELECT sku,name,category,quantity,reorder_level,location,supplier FROM items ORDER BY sku').all();
    res.json(rows);
  });

  app.post('/api/items/import', requireAdmin, (req, res) => {
    // Accept JSON array to bulk import (idempotent by SKU)
    const items = req.body;
    const insert = db.prepare('INSERT OR REPLACE INTO items (sku,name,category,quantity,reorder_level,location,supplier) VALUES (?,?,?,?,?,?,?)');
    const trx = db.transaction((rows) => {
      for (const r of rows) insert.run(r.sku, r.name, r.category, r.quantity || 0, r.reorder_level || 10, r.location || '', r.supplier || '');
    });
    try { trx(items); res.json({ imported: items.length }); } catch (e) { res.status(500).json({ error: String(e) }); }
  });

  app.post('/api/items/:sku/adjust', requireAdmin, (req, res) => {
    // { delta: 5 } to add or negative to remove
    const sku = req.params.sku;
    const delta = parseInt(req.body.delta || 0, 10);
    const cur = db.prepare('SELECT quantity FROM items WHERE sku = ?').get(sku);
    if (!cur) return res.status(404).json({ error: 'not found' });
    const updated = Math.max(0, cur.quantity + delta);
    db.prepare('UPDATE items SET quantity = ? WHERE sku = ?').run(updated, sku);
    res.json({ sku, quantity: updated });
  });

} else {
  // JSON-backed implementation for environments where native sqlite cannot be built
  app.get('/api/items', (req, res) => {
    const items = readJsonDb();
    // return selected fields
    res.json(items.map(({ sku,name,category,quantity,reorder_level,location,supplier }) => ({ sku,name,category,quantity,reorder_level,location,supplier })));
  });

  app.post('/api/items/import', requireAdmin, (req, res) => {
    const items = req.body || [];
    const cur = readJsonDb();
    const bySku = new Map(cur.map(i => [i.sku, i]));
    for (const it of items) {
      bySku.set(it.sku, Object.assign({}, it));
    }
    const merged = Array.from(bySku.values()).sort((a,b) => a.sku.localeCompare(b.sku));
    writeJsonDb(merged);
    res.json({ imported: items.length });
  });

  app.post('/api/items/:sku/adjust', requireAdmin, (req, res) => {
    const sku = req.params.sku;
    const delta = parseInt(req.body.delta || 0, 10);
    const items = readJsonDb();
    const idx = items.findIndex(i => i.sku === sku);
    if (idx === -1) return res.status(404).json({ error: 'not found' });
    items[idx].quantity = Math.max(0, (items[idx].quantity || 0) + delta);
    writeJsonDb(items);
    res.json({ sku, quantity: items[idx].quantity });
  });
}

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Hospital API listening on ${PORT} (storage: ${Database ? 'sqlite' : 'json'})`));
