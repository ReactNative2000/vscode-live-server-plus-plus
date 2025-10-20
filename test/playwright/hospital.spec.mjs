import { test, expect } from '@playwright/test'

test('courthouse hospital demo loads items from hospital API', async ({ page }) => {
  await page.goto('http://127.0.0.1:8080/courthouse/hospital.html')
  // The demo injects a list or table; wait for any content indicating loaded items
  const list = page.locator('#hospital-items, .hospital-list, table')
  await expect(list.first()).toBeVisible({ timeout: 5000 })
})
