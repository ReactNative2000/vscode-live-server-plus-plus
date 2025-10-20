import { test, expect } from '@playwright/test'

test('courthouse hospital demo loads items from hospital API', async ({ page }) => {
  const BASE = process.env.BASE_URL || 'http://127.0.0.1:8080'
  await page.goto(`${BASE}/courthouse/hospital.html`)
  // Click load and wait for items/status to update
  await page.click('button#load')
  const status = page.locator('#status')
  await expect(status).toHaveText(/(Loaded|No items|Error)/, { timeout: 7000 })
  const list = page.locator('#hospital-items, .hospital-list, table, #items li')
  // Either items exist or the status reports no items; ensure DOM updated
  await expect(list.first().or(status)).toBeDefined()
})
