const { test, expect } = require('@playwright/test');

test('orcid connect returns redirect with expected params', async ({ request }) => {
  const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3010';
  const resp = await request.get(base + '/orcid/connect', { maxRedirects: 0 }).catch(e => e.response || null);
  expect(resp).not.toBeNull();
  expect(resp.status()).toBe(302);
  const loc = resp.headers()['location'] || resp.headers().location;
  expect(loc).toBeTruthy();
  expect(loc).toContain('client_id=');
  expect(loc).toContain('redirect_uri=');
});
