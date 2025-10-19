#!/usr/bin/env node
// Simple SVG -> PNG renderer using headless Chromium (puppeteer)
// Usage: npm install puppeteer --no-save && node tools/render-svg.js input.svg output.png 2000

const fs = require('fs');
const path = require('path');

async function render(input, output, size) {
  const puppeteer = require('puppeteer');
  const absInput = path.resolve(input);
  const svg = fs.readFileSync(absInput, 'utf8');

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: size, height: size });
    const content = `<!doctype html><html><body style="margin:0;padding:0;background:transparent">${svg}</body></html>`;
    await page.setContent(content, { waitUntil: 'networkidle0' });
    const element = await page.$('svg');
    if (!element) throw new Error('SVG element not found in input file');
    await element.screenshot({ path: output, omitBackground: true });
    console.log('Rendered', output);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  const [,, input, output, sizeArg] = process.argv;
  if (!input || !output) {
    console.error('Usage: node tools/render-svg.js input.svg output.png [size]');
    process.exit(2);
  }
  const size = parseInt(sizeArg || '2000', 10);
  render(input, output, size).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
