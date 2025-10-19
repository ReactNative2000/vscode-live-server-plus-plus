#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const categories = [
  'Consumables', 'PPE', 'Equipment', 'Medication', 'Surgical', 'Diagnostics', 'Cleaning', 'Office'
];

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function skuFor(i) { return `HSP${String(i).padStart(5,'0')}`; }

function makeItem(i) {
  const category = categories[i % categories.length];
  const qty = randomInt(0, 200);
  const reorder = Math.max(10, Math.floor(qty * 0.2));
  const item = {
    sku: skuFor(i),
    name: `${category} Item ${i}`,
    category,
    quantity: qty,
    reorder_level: reorder,
    location: `Ward ${randomInt(1,10)} - Shelf ${randomInt(1,6)}`,
    supplier: `Supplier ${((i%10)+1)}`
  };
  return item;
}

function generate(n, outJson, outCsv) {
  const items = [];
  for (let i = 1; i <= n; i++) items.push(makeItem(i));
  fs.mkdirSync(path.dirname(outJson), { recursive: true });
  fs.writeFileSync(outJson, JSON.stringify(items, null, 2));
  const csv = ['sku,name,category,quantity,reorder_level,location,supplier'];
  items.forEach(it => csv.push([it.sku, `"${it.name}"`, it.category, it.quantity, it.reorder_level, `"${it.location}"`, it.supplier].join(',')));
  fs.writeFileSync(outCsv, csv.join('\n'));
  console.log(`Wrote ${n} items to ${outJson} and ${outCsv}`);
}

if (require.main === module) {
  const n = parseInt(process.argv[2] || '200', 10);
  const outJson = path.resolve(process.cwd(), 'data/hospital_stock.json');
  const outCsv = path.resolve(process.cwd(), 'data/hospital_stock.csv');
  generate(n, outJson, outCsv);
}
