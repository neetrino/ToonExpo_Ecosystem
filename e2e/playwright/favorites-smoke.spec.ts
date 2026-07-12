import { expect, test } from '@playwright/test';

import { SUNRISE_DETAIL_PATH, SUNRISE_NAME } from './helpers/catalog';

test.describe('favorites smoke', () => {
  test('logged-out save CTA redirects to login with callbackUrl', async ({ page }) => {
    await page.goto(SUNRISE_DETAIL_PATH);
    await expect(page.getByRole('heading', { name: SUNRISE_NAME, level: 1 })).toBeVisible();

    await page.getByRole('link', { name: 'Save' }).click();
    await expect(page).toHaveURL(/\/en\/login/);

    const callbackUrl = new URL(page.url()).searchParams.get('callbackUrl');
    expect(callbackUrl).toBe(SUNRISE_DETAIL_PATH);
  });
});
