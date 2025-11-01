const { chromium } = require('playwright');

(async ()=>{
  const url = process.env.URL || 'http://127.0.0.1:8080/courthouse/';
  console.log('URL:', url);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  try{
    const resp = await page.goto(url, { waitUntil: 'load', timeout: 10000 });
    console.log('response status:', resp ? resp.status() : 'no-response');
    const title = await page.title();
    console.log('page.title():', JSON.stringify(title));
    const content = await page.content();
    console.log('\n--- page content (first 1000 chars) ---\n');
    console.log(content.slice(0, 1000));
    await browser.close();
    process.exit(0);
  }catch(e){
    console.error('ERROR', e && e.message);
    try{ await browser.close(); }catch(_){}
    process.exit(2);
  }
})();
const { chromium } = require('playwright');

(async ()=>{
  const url = process.env.URL || 'http://127.0.0.1:8080/courthouse/';
  console.log('URL:', url);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  try{
    const resp = await page.goto(url, { waitUntil: 'load', timeout: 10000 });
    console.log('response status:', resp ? resp.status() : 'no-response');
    const title = await page.title();
    console.log('page.title():', JSON.stringify(title));
    const content = await page.content();
    console.log('\n--- page content (first 1000 chars) ---\n');
    console.log(content.slice(0, 1000));
    await browser.close();
    process.exit(0);
  }catch(e){
    console.error('ERROR', e && e.message);
    try{ await browser.close(); }catch(_){}
    process.exit(2);
  }
})();
