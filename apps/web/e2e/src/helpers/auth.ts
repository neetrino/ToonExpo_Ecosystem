import type { Page } from '@playwright/test';

import { SEED_PASSWORD } from './env.js';

/** Keep in sync with `CLIENT_SESSION_HINT_STORAGE_KEY` in session-hint.ts. */
const CLIENT_SESSION_HINT_STORAGE_KEY = 'toonexpo_session_hint';

/**
 * Fills the hy-locale login form and waits for navigation away from login.
 */
export const loginAs = async (
  page: Page,
  email: string,
  password: string = SEED_PASSWORD,
): Promise<void> => {
  await page.goto('/hy/auth/login');
  await page.getByLabel('Էլ․ փոստ').fill(email);
  await page.getByLabel('Գաղտնաբառ', { exact: true }).fill(password);
  await page.locator('form').getByRole('button', { name: 'Մուտք' }).click();
  await page.waitForURL((url) => !url.pathname.includes('/auth/login'));
  // Client Components (favorites, price overlay) key off this same-tab hint.
  await page.waitForFunction(
    (key) => sessionStorage.getItem(key) === '1',
    CLIENT_SESSION_HINT_STORAGE_KEY,
  );
};

/**
 * Clears the session via the profile logout control when present.
 */
export const logoutIfPossible = async (page: Page): Promise<void> => {
  const logout = page.locator('button.w-full').filter({ hasText: /Ելք|Log out|Выйти/i });
  if (await logout.isVisible().catch(() => false)) {
    await logout.click();
    await page.waitForURL(/\/hy(\/|$)|\/auth\/login/);
  }
};
