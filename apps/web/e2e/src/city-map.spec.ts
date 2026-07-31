import { expect, test } from '@playwright/test';

import { loginAs } from './helpers/auth.js';
import { SEED_PLATFORM_ADMIN_EMAIL } from './helpers/env.js';

test.describe('city 3d map smoke', () => {
  test('platform admin opens city map editor', async ({ page }) => {
    await loginAs(page, SEED_PLATFORM_ADMIN_EMAIL);
    await page.goto('/hy/admin/city-map');
    await expect(page.getByRole('heading', { name: 'Քաղաքի 3D քարտեզ' })).toBeVisible();
    await expect(page.getByText('Տեղադրման խմբագրիչ')).toBeVisible();
    await expect(page.getByTestId('city-map-view')).toBeVisible();
    await expect(page.locator('.maplibregl-canvas').first()).toBeVisible({
      timeout: 45_000,
    });
  });

  test('homepage MAP VIEW mounts maplibre canvas', async ({ page }) => {
    await page.goto('/en');
    const mapHeading = page.getByRole('heading', {
      name: 'Every new development on one map.',
    });
    await expect(mapHeading).toBeVisible();
    await mapHeading.scrollIntoViewIfNeeded();
    await expect(page.getByPlaceholder('Search buildings or address…')).toBeVisible();
    await expect(page.getByTestId('city-map-view')).toBeVisible();
    await expect(page.locator('.maplibregl-canvas').first()).toBeVisible({
      timeout: 45_000,
    });
  });
});
