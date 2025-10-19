const express = require('express');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.resolve(__dirname, 'hospital.db');
const app = express();
app.use(bodyParser.json());

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

app.post('/api/items/import', (req, res) => {
  // Accept JSON array to bulk import (idempotent by SKU)
  const items = req.body;
  const insert = db.prepare('INSERT OR REPLACE INTO items (sku,name,category,quantity,reorder_level,location,supplier) VALUES (?,?,?,?,?,?,?)');
  const trx = db.transaction((rows) => {
    for (const r of rows) insert.run(r.sku, r.name, r.category, r.quantity || 0, r.reorder_level || 10, r.location || '', r.supplier || '');
  });
  try { trx(items); res.json({ imported: items.length }); } catch (e) { res.status(500).json({ error: String(e) }); }
});

app.post('/api/items/:sku/adjust', (req, res) => {
  // { delta: 5 } to add or negative to remove
  const sku = req.params.sku;
  const delta = parseInt(req.body.delta || 0, 10);
  const cur = db.prepare('SELECT quantity FROM items WHERE sku = ?').get(sku);
  if (!cur) return res.status(404).json({ error: 'not found' });
  const updated = Math.max(0, cur.quantity + delta);
  db.prepare('UPDATE items SET quantity = ? WHERE sku = ?').run(updated, sku);
  res.json({ sku, quantity: updated });
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Hospital API listening on ${PORT}`));
