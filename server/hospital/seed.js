const fs = require('fs');
const path = require('path');
let Database;
try { Database = require('better-sqlite3'); } catch (e) { Database = null; }

const DB_PATH = path.resolve(__dirname, 'hospital.db');
const DB_JSON = path.resolve(__dirname, 'db.json');
const dataPath = path.resolve(process.cwd(), 'data/hospital_stock.json');

if (!fs.existsSync(dataPath)) {
  console.error('data/hospital_stock.json not found. Run tools/generate_hospital_stock.js first.');
  process.exit(1);
}

const items = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

if (Database) {
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
  const insert = db.prepare('INSERT OR REPLACE INTO items (sku,name,category,quantity,reorder_level,location,supplier) VALUES (?,?,?,?,?,?,?)');
  const trx = db.transaction((rows) => { for (const r of rows) insert.run(r.sku, r.name, r.category, r.quantity || 0, r.reorder_level || 10, r.location || '', r.supplier || ''); });
  trx(items);
  console.log(`Seeded ${items.length} items into ${DB_PATH}`);
} else {
  // write JSON DB
  fs.writeFileSync(DB_JSON, JSON.stringify(items, null, 2));
  console.log(`Wrote ${items.length} items to JSON DB ${DB_JSON}`);
}
