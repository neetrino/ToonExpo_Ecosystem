import type { Page } from '@playwright/test';

/**
 * Signs in via the public `/en/login` form and waits until the login URL is left.
 */
export async function loginAs(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/en/login');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL((url) => !url.pathname.endsWith('/login'));
}

/** Clears Auth.js session cookies so the next navigation is anonymous. */
export async function clearSession(page: Page): Promise<void> {
  await page.context().clearCookies();
}
