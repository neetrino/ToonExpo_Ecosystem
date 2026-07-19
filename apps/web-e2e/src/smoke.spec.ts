import { expect, test } from '@playwright/test';

import { loginAs } from './helpers/auth.js';
import {
  SEED_APARTMENT_NUMBER,
  SEED_APARTMENT_VISIBLE_AFTER_LOGIN_ID,
  SEED_BUILDER_ADMIN_EMAIL,
  SEED_BUILDER_COMPANY_ID,
  SEED_BUILDING_NAME,
  SEED_BUYER_EMAIL,
  SEED_FLOOR_LABEL,
  SEED_PLATFORM_ADMIN_EMAIL,
  SEED_PROJECT_ID,
  SEED_PROJECT_NAME,
} from './helpers/env.js';

/** hy-locale seed translation for Northern Avenue Residences. */
const SEED_PROJECT_NAME_HY = 'Հյուսիսային պողոտայի նստավայրեր';

test.describe('smoke', () => {
  test('public home (hy) shows featured projects', async ({ page }) => {
    await page.goto('/hy');
    await expect(page.getByRole('heading', { name: 'Նախագծեր, որոնք արժե հետևել։' })).toBeVisible();
    await expect(
      page
        .getByRole('link', { name: SEED_PROJECT_NAME_HY })
        .or(page.getByRole('link', { name: SEED_PROJECT_NAME }))
        .first(),
    ).toBeVisible();
  });

  test('projects catalog drill-down to apartment', async ({ page }) => {
    await page.goto('/hy/projects');
    await expect(page.getByRole('heading', { name: 'Նախագծեր', level: 1 })).toBeVisible();
    await expect(
      page
        .getByRole('link', { name: SEED_PROJECT_NAME_HY })
        .or(page.getByRole('link', { name: SEED_PROJECT_NAME }))
        .first(),
    ).toBeVisible();

    await page.goto(`/hy/projects/${SEED_PROJECT_ID}`);
    await page.getByRole('link', { name: SEED_BUILDING_NAME }).click();
    await expect(page).toHaveURL(/\/buildings\//);

    await page.getByRole('link', { name: SEED_FLOOR_LABEL }).click();
    await expect(page).toHaveURL(/\/floors\//);

    await page.getByRole('link', { name: new RegExp(`Բն\\.\\s*${SEED_APARTMENT_NUMBER}`) }).click();
    await expect(page).toHaveURL(
      new RegExp(`/hy/apartments/${SEED_APARTMENT_VISIBLE_AFTER_LOGIN_ID}`),
    );
    await expect(
      page.getByRole('heading', {
        name: new RegExp(`Բն\\.\\s*${SEED_APARTMENT_NUMBER}`),
      }),
    ).toBeVisible();
  });

  test('set-password link reads token from URL fragment', async ({ page }) => {
    await page.goto('/hy/auth/set-password#token=fake-test-token');

    await expect(page.getByRole('heading', { name: 'Սահմանեք գաղտնաբառ' })).toBeVisible();
    await expect(page.getByLabel('Գաղտնաբառ', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Հաստատել գաղտնաբառը', { exact: true })).toBeVisible();
    await expect(page).toHaveURL('/hy/auth/set-password');
    await expect.poll(async () => page.evaluate(() => window.location.hash)).toBe('');
  });

  test('buyer registration lands on profile', async ({ page }) => {
    const stamp = Date.now();
    const email = `e2e.buyer.${stamp}@toonexpo.local`;

    await page.goto('/hy/auth/register');
    await page.getByLabel('Անուն ազգանուն').fill(`E2E Buyer ${stamp}`);
    await page.getByLabel('Էլ․ փոստ').fill(email);
    await page.getByLabel('Հեռախոս').fill(`+3749${String(stamp).slice(-7)}`);
    await page.getByLabel('Գաղտնաբառ').fill('E2eBuyerPass123!');
    await page.getByRole('button', { name: 'Ստեղծել հաշիվ' }).click();

    await expect(page).toHaveURL(/\/hy\/profile/);
    await expect(page.getByRole('heading', { name: 'Իմ պրոֆիլը' })).toBeVisible();
  });

  test('buyer can change password and re-login', async ({ page }) => {
    const stamp = Date.now();
    const email = `e2e.pwd.${stamp}@toonexpo.local`;
    const initialPassword = 'E2eBuyerPass123!';
    const nextPassword = 'E2eNewPass456!';

    await page.goto('/hy/auth/register');
    await page.getByLabel('Անուն ազգանուն').fill(`E2E Pwd ${stamp}`);
    await page.getByLabel('Էլ․ փոստ').fill(email);
    await page.getByLabel('Հեռախոս').fill(`+3749${String(stamp).slice(-7)}`);
    await page.getByLabel('Գաղտնաբառ').fill(initialPassword);
    await page.getByRole('button', { name: 'Ստեղծել հաշիվ' }).click();
    await expect(page).toHaveURL(/\/hy\/profile/);

    await page.goto('/hy/profile/password');
    await page.getByLabel('Ընթացիկ գաղտնաբառ', { exact: true }).fill(initialPassword);
    await page.getByLabel('Նոր գաղտնաբառ', { exact: true }).fill(nextPassword);
    await page.getByLabel('Հաստատել նոր գաղտնաբառը', { exact: true }).fill(nextPassword);

    const changeResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/auth/change-password') &&
        response.request().method() === 'POST' &&
        response.ok(),
    );
    await page.getByRole('button', { name: 'Պահպանել նոր գաղտնաբառը' }).click();
    await changeResponse;
    await expect(page.getByText('Գաղտնաբառը հաջողությամբ թարմացվեց։')).toBeVisible();

    await page.goto('/hy/profile');
    await page.getByRole('button', { name: 'Ելք' }).first().click();
    await page.waitForURL(/\/hy(\/|$)|\/auth\/login/);

    await page.goto('/hy/auth/login');
    await page.getByLabel('Էլ․ փոստ').fill(email);
    await page.getByLabel('Գաղտնաբառ').fill(nextPassword);
    await page.getByRole('button', { name: 'Մուտք' }).first().click();
    await page.waitForURL((url) => !url.pathname.includes('/auth/login'));
    await expect(page).toHaveURL(/\/hy\/profile/);
  });

  test('buyer login shows QR on profile', async ({ page }) => {
    await loginAs(page, SEED_BUYER_EMAIL);
    await page.goto('/hy/profile/qr');
    await expect(page.getByRole('heading', { name: 'Իմ QR' })).toBeVisible();
    await expect(page.getByRole('img', { name: /QR/ })).toBeVisible();
  });

  test('favorites add and remove', async ({ page }) => {
    await loginAs(page, SEED_BUYER_EMAIL);
    await page.goto(`/hy/apartments/${SEED_APARTMENT_VISIBLE_AFTER_LOGIN_ID}`);

    const addButton = page.getByRole('button', {
      name: 'Ավելացնել ընտրյալներին',
    });
    const removeButton = page.getByRole('button', {
      name: 'Հեռացնել ընտրյալներից',
    });

    if (await removeButton.isVisible().catch(() => false)) {
      const removeResponse = page.waitForResponse(
        (response) =>
          response.url().includes('/favorites') &&
          response.request().method() === 'DELETE' &&
          response.ok(),
      );
      await removeButton.click();
      await removeResponse;
      await expect(addButton).toBeVisible();
    }

    const addResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/favorites') &&
        response.request().method() === 'PUT' &&
        response.ok(),
    );
    await addButton.click();
    await addResponse;
    await expect(removeButton).toBeVisible();

    await page.goto('/hy/profile/favorites');
    await expect(page.getByRole('heading', { name: 'Իմ ընտրյալները' })).toBeVisible();
    const favoriteLink = page
      .getByRole('link', { name: new RegExp(SEED_APARTMENT_NUMBER) })
      .first();
    await expect(favoriteLink).toBeVisible();

    const listRemove = page.getByRole('button', {
      name: 'Հեռացնել ընտրյալներից',
    });
    const listRemoveResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/favorites') &&
        response.request().method() === 'DELETE' &&
        response.ok(),
    );
    await listRemove.first().click();
    await listRemoveResponse;
    await expect(favoriteLink).toHaveCount(0, { timeout: 20_000 });
  });

  test('login-gated apartment price', async ({ page }) => {
    const apartmentPath = `/hy/apartments/${SEED_APARTMENT_VISIBLE_AFTER_LOGIN_ID}`;
    const signInCta = 'Մուտք գործեք՝ գինը տեսնելու համար';

    await page.goto(apartmentPath);
    await expect(page.getByRole('link', { name: signInCta })).toBeVisible();

    await loginAs(page, SEED_BUYER_EMAIL);
    await page.goto(apartmentPath);
    await expect(page.getByRole('link', { name: signInCta })).toHaveCount(0);
    await expect(page.locator('p.font-brand').filter({ hasText: /\d/ }).first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test('builder portal dashboard', async ({ page }) => {
    await loginAs(page, SEED_BUILDER_ADMIN_EMAIL);
    await expect(page).toHaveURL(/\/hy\/builder/);
    await expect(page.getByRole('heading', { name: 'Վահանակ' })).toBeVisible();

    await page
      .getByRole('navigation', { name: 'Կառուցապատողի նավիգացիա' })
      .getByRole('link', { name: 'Նախագծեր', exact: true })
      .click();
    await expect(page).toHaveURL(/\/hy\/builder\/projects/);
    await expect(
      page.getByText(SEED_PROJECT_NAME).or(page.getByText(SEED_PROJECT_NAME_HY)).first(),
    ).toBeVisible();
  });

  test('mortgage calculator shows monthly payment', async ({ page }) => {
    await page.goto('/hy/mortgage');
    await page.getByRole('button', { name: /Standard residential mortgage/ }).click();
    await page.getByLabel('Գույքի արժեք (դրամ)').fill('45000000');
    await expect(page.getByRole('heading', { name: 'Գնահատական' }).first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(
      page
        .getByText(/\/ ամիս/)
        .filter({ visible: true })
        .first(),
    ).toBeVisible();
  });

  test('language switch hy → ru', async ({ page }) => {
    await page.goto('/hy');
    await page.getByRole('group', { name: 'Լեզու' }).getByRole('button', { name: 'Рус' }).click();
    await expect(page).toHaveURL(/\/ru(\/|$)/);
    await expect(
      page.getByRole('heading', { name: 'Проекты, на которые стоит смотреть.' }),
    ).toBeVisible();
  });

  test('buyer cannot access admin', async ({ page }) => {
    await loginAs(page, SEED_BUYER_EMAIL);
    await page.goto('/hy/admin');
    await expect(page.getByRole('heading', { name: 'Էջը չի գտնվել' })).toBeVisible();
  });

  test('admin can edit a company catalog project', async ({ page }) => {
    await loginAs(page, SEED_PLATFORM_ADMIN_EMAIL);
    await page.goto(
      `/hy/admin/companies/${SEED_BUILDER_COMPANY_ID}/catalog/projects/${SEED_PROJECT_ID}`,
    );
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const nameField = page.getByLabel('Անուն', { exact: true }).first();
    await expect(nameField).toBeVisible();
    const originalName = await nameField.inputValue();
    const tempName = `${originalName} E2E`;

    await nameField.fill(tempName);
    const saveButton = page.getByRole('button', { name: 'Պահպանել', exact: true });
    await expect(saveButton).toBeEnabled();
    const saveResponse = page.waitForResponse(
      (response) =>
        response.url().includes(`/admin/companies/${SEED_BUILDER_COMPANY_ID}/catalog/projects/`) &&
        response.request().method() === 'PATCH' &&
        response.ok(),
    );
    await saveButton.click();
    await saveResponse;
    await expect(page.getByRole('status')).toContainText('Նախագիծը թարմացված է');

    // Reload so form defaults match the temp name; restoring original then dirties the form.
    await page.reload();
    await expect(nameField).toHaveValue(tempName);
    await nameField.fill(originalName);
    await expect(saveButton).toBeEnabled();
    const restoreResponse = page.waitForResponse(
      (response) =>
        response.url().includes(`/admin/companies/${SEED_BUILDER_COMPANY_ID}/catalog/projects/`) &&
        response.request().method() === 'PATCH' &&
        response.ok(),
    );
    await saveButton.click();
    await restoreResponse;
    await expect(page.getByRole('status')).toContainText('Նախագիծը թարմացված է');
  });
});
