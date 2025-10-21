import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://127.0.0.1:8080'

test('earth demo loads and map exists', async ({ page }) => {
  await page.goto(`${BASE}/earth.html`)
  // ensure map container is present
  await expect(page.locator('#map')).toHaveCount(1)
  // wait until the map object is exposed by the page
  await page.waitForFunction(() => !!window.map, null, { timeout: 5000 })
  const title = await page.title()
  expect(title).toMatch(/Earth demo/)
})
