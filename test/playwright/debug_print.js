const playwright = require('playwright');
(async () => {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto('http://127.0.0.1:8080/courthouse/hospital.html', { waitUntil: 'load', timeout: 10000 });
    const content = await page.content();
    console.log(content.slice(0, 2000));
  } catch (e) {
    console.error('ERROR', e.message);
  } finally {
    await browser.close();
  }
})();
