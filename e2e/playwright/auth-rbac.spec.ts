import { expect, test } from '@playwright/test';

import { clearSession, loginAs } from './helpers/auth';
import { getAdminSeed, getBuilderSeed, getEntranceSeed } from './helpers/env';

test.describe('auth RBAC', () => {
  test('builder reaches portal overview', async ({ page }) => {
    const builder = getBuilderSeed();
    test.skip(!builder, 'SEED_DEMO_BUILDER_PASSWORD not set');

    await loginAs(page, builder!.email, builder!.password);
    await page.goto('/en/portal');
    await expect(page).toHaveURL(/\/en\/portal\/?$/);
    await expect(page.getByRole('heading', { name: 'Overview', level: 2 })).toBeVisible();
  });

  test('non-builder cannot open portal', async ({ page }) => {
    const entrance = getEntranceSeed();
    test.skip(!entrance, 'SEED_ENTRANCE_EMAIL / SEED_ENTRANCE_PASSWORD not set');

    await loginAs(page, entrance!.email, entrance!.password);
    await page.goto('/en/portal');
    await expect(page).not.toHaveURL(/\/en\/portal/);
  });

  test('admin reaches admin area', async ({ page }) => {
    const admin = getAdminSeed();
    test.skip(!admin, 'SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set');

    await clearSession(page);
    await loginAs(page, admin!.email, admin!.password);
    await page.goto('/en/admin');
    await expect(page).toHaveURL(/\/en\/admin\/?$/);
    await expect(page.getByRole('heading', { name: 'Admin' }).first()).toBeVisible();
  });

  test('entrance staff reaches check-in', async ({ page }) => {
    const entrance = getEntranceSeed();
    test.skip(!entrance, 'SEED_ENTRANCE_EMAIL / SEED_ENTRANCE_PASSWORD not set');

    await clearSession(page);
    await loginAs(page, entrance!.email, entrance!.password);
    await page.goto('/en/checkin');
    await expect(page).toHaveURL(/\/en\/checkin\/?$/);
    await expect(page.getByRole('heading', { name: 'Entrance check-in', level: 1 })).toBeVisible();
  });
});
