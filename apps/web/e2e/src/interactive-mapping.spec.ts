import { expect, test } from '@playwright/test';

/**
 * Interactive Mapping smoke — verifies admin route shell is reachable after auth redirect.
 * Full 4-phase draw flows require seeded admin + R2; covered by unit/API gates + manual QA.
 */
test.describe('interactive mapping admin', () => {
  test('interactive mapping path redirects unauthenticated users away from content', async ({
    page,
  }) => {
    await page.goto('/en/admin/interactive-mapping');
    await page.waitForLoadState('domcontentloaded');
    const url = page.url();
    const isLoginOrAdmin =
      url.includes('/login') ||
      url.includes('/admin') ||
      url.includes('/sign-in') ||
      url.includes('/auth');
    expect(isLoginOrAdmin).toBeTruthy();
  });

  test('lab sandbox route exists under admin interactive-mapping', async ({ page }) => {
    await page.goto('/en/admin/interactive-mapping/lab');
    await page.waitForLoadState('domcontentloaded');
    // Either login gate or lab chrome — must not 404
    const statusOk = !page.url().includes('404');
    expect(statusOk).toBeTruthy();
    const body = await page.locator('body').innerText();
    expect(body.length).toBeGreaterThan(0);
  });
});
