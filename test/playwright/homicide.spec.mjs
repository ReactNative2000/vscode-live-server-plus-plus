import { test, expect } from '@playwright/test'

test('courthouse homicide demo loads cases from homicide API', async ({ page }) => {
  await page.goto('http://127.0.0.1:8080/courthouse/homicide.html')
  // The demo injects a list; wait for the items container to be visible
  const list = page.locator('#items')
  await expect(list).toBeVisible({ timeout: 5000 })
})
