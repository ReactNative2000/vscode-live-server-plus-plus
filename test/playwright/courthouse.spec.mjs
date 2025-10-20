import { test, expect } from '@playwright/test'

test('courthouse main page has title and CTA', async ({ page }) => {
  // http-server serves the `docs` directory as the site root, so the
  // Courthouse page is available at /courthouse/ when served with
  // `npx http-server docs -p 8080` (used locally and in CI).
  await page.goto('http://127.0.0.1:8080/courthouse/')
  await expect(page).toHaveTitle(/Courthouse/)
  const cta = page.locator('a.cta')
  const count = await cta.count()
  // Expect at least one CTA on the page
  expect(count).toBeGreaterThan(0)
})
