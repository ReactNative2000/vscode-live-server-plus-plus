import { test, expect } from '@playwright/test'

test('courthouse main page has title and CTA', async ({ page }) => {
<<<<<<< HEAD
  // http-server serves the `docs` directory as the site root,
  // so the Courthouse page is available at /courthouse/
  await page.goto('http://127.0.0.1:8080/courthouse/')
  await expect(page).toHaveTitle(/Courthouse/)
  const cta = page.locator('a.cta')
  const count = await cta.count()
  // Expect at least one CTA on the page
  expect(count).toBeGreaterThan(0)
=======
  await page.goto('http://127.0.0.1:8080/docs/courthouse/')
  await expect(page).toHaveTitle(/Courthouse/)
  const cta = page.locator('a.cta')
  await expect(cta).toHaveCount(1)
>>>>>>> 56bc683 (test(e2e): add Playwright E2E test and PR workflow)
})
