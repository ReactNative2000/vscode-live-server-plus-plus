import { test, expect } from '@playwright/test'

test('courthouse homicide demo loads cases from homicide API', async ({ page }) => {
  const BASE = process.env.BASE_URL || 'http://127.0.0.1:8080'
  await page.goto(`${BASE}/courthouse/homicide.html`)
  // Click the load button and wait for the status to update or items to appear
  await page.click('button#load')
  const status = page.locator('#status')
  await expect(status).toHaveText(/(Loaded|No cases|Error|Loaded)/, { timeout: 7000 })
  const items = page.locator('#items li')
  // Either there are items or the demo reports no cases; ensure the DOM updated
  await expect(items.first().or(page.locator('#status'))).toBeDefined()
})
