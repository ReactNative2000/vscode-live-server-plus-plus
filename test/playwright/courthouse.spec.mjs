import { test, expect } from '@playwright/test'

test('courthouse main page has title and CTA', async ({ page }) => {
  await page.goto('http://127.0.0.1:8080/docs/courthouse/')
  await expect(page).toHaveTitle(/Courthouse/)
  const cta = page.locator('a.cta')
  await expect(cta).toHaveCount(1)
})
