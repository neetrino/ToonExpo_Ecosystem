import { expect, test } from '@playwright/test';

import { HIDDEN_COURT_NAME, SUNRISE_DETAIL_PATH, SUNRISE_NAME } from './helpers/catalog';

test.describe('public catalog', () => {
  test('lists Sunrise Residence and hides Hidden Court', async ({ page }) => {
    await page.goto('/en/projects');
    await expect(page.getByRole('heading', { name: SUNRISE_NAME })).toBeVisible();
    await expect(page.getByText(HIDDEN_COURT_NAME)).toHaveCount(0);
  });

  test('opens Sunrise Residence project detail', async ({ page }) => {
    await page.goto('/en/projects');
    await page
      .getByRole('link', { name: new RegExp(SUNRISE_NAME) })
      .first()
      .click();
    await expect(page).toHaveURL(new RegExp(`${SUNRISE_DETAIL_PATH}$`));
    await expect(page.getByRole('heading', { name: SUNRISE_NAME, level: 1 })).toBeVisible();
  });
});
