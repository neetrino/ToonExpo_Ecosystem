/**
 * Seeds platform home-hero MediaAssets + PlatformSetting so Home reads from DB.
 *
 * - Ensures MediaAsset rows for the default hero and a temporary test image
 *   (fileUrl = existing R2 static keys; no re-upload).
 * - With `--test-swap`: briefly points the setting at the test image, prints it,
 *   then restores the default hero (still from DB).
 *
 * Usage (repo root):
 *   pnpm exec node --env-file=.env scripts/seed-home-hero-setting.mjs
 *   pnpm exec node --env-file=.env scripts/seed-home-hero-setting.mjs --test-swap
 */
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Stable ids so re-runs stay idempotent. */
const HOME_HERO_MEDIA_ID = 'media_platform_home_hero';
const HOME_HERO_TEST_MEDIA_ID = 'media_platform_home_hero_test';
const PLATFORM_SETTING_KEY = 'home.hero.mediaAssetId';

const DEFAULT_HERO_PATH = '/images/hero-building.webp';
/** Temporary alternate image for a visible swap test. */
const TEST_HERO_PATH = '/demo/partner-facade.webp';

const resolvePublicUrl = (assetPath) => {
  const base = process.env.R2_PUBLIC_URL?.trim() || process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim();
  if (!base) {
    throw new Error('R2_PUBLIC_URL (or NEXT_PUBLIC_R2_PUBLIC_URL) is required');
  }
  const normalized = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  return `${base.replace(/\/$/, '')}${normalized}`;
};

const upsertImageAsset = async (db, { id, fileUrl, title }) => {
  await db.mediaAsset.upsert({
    where: { id },
    create: {
      id,
      type: 'image',
      fileUrl,
      title,
      altText: title,
      ownerCompanyId: null,
      relatedEntityType: 'platform_setting',
      relatedEntityId: PLATFORM_SETTING_KEY,
    },
    update: {
      fileUrl,
      title,
      altText: title,
      type: 'image',
    },
  });
};

const setHomeHero = async (db, mediaAssetId) => {
  await db.platformSetting.upsert({
    where: { key: PLATFORM_SETTING_KEY },
    create: {
      key: PLATFORM_SETTING_KEY,
      value: mediaAssetId,
      valueType: 'string',
      description: 'Media asset id for the public home page hero banner image',
    },
    update: {
      value: mediaAssetId,
    },
  });
};

const fetchPublicHero = async () => {
  const response = await fetch('http://localhost:4000/api/v1/site/home-hero');
  if (!response.ok) {
    throw new Error(`GET /site/home-hero failed: ${response.status}`);
  }
  return response.json();
};

const main = async () => {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const doTestSwap = process.argv.includes('--test-swap');
  const defaultUrl = resolvePublicUrl(DEFAULT_HERO_PATH);
  const testUrl = resolvePublicUrl(TEST_HERO_PATH);

  const dbModuleUrl = pathToFileURL(path.join(ROOT, 'packages/db/dist/index.js')).href;
  const { createPrismaClient } = await import(dbModuleUrl);
  const db = createPrismaClient({ connectionString: databaseUrl });

  try {
    await upsertImageAsset(db, {
      id: HOME_HERO_MEDIA_ID,
      fileUrl: defaultUrl,
      title: 'Home hero (default)',
    });
    await upsertImageAsset(db, {
      id: HOME_HERO_TEST_MEDIA_ID,
      fileUrl: testUrl,
      title: 'Home hero (test swap)',
    });

    if (doTestSwap) {
      await setHomeHero(db, HOME_HERO_TEST_MEDIA_ID);
      const testHero = await fetchPublicHero();
      console.log('[seed-home-hero] TEST swap OK:', JSON.stringify(testHero));
      if (testHero.mediaAssetId !== HOME_HERO_TEST_MEDIA_ID) {
        throw new Error('Test swap did not stick in API response');
      }
    }

    await setHomeHero(db, HOME_HERO_MEDIA_ID);
    const finalHero = await fetchPublicHero();
    console.log('[seed-home-hero] DEFAULT restored:', JSON.stringify(finalHero));
    if (finalHero.mediaAssetId !== HOME_HERO_MEDIA_ID) {
      throw new Error('Default hero was not returned by API');
    }
    if (!finalHero.imageUrl?.includes('hero-building.webp')) {
      throw new Error(`Unexpected imageUrl: ${finalHero.imageUrl}`);
    }

    console.log('[seed-home-hero] Done — Home reads hero-building.webp from PlatformSetting / MediaAsset.');
  } finally {
    await db.$disconnect();
  }
};

main().catch((error) => {
  console.error('[seed-home-hero] Failed:', error);
  process.exitCode = 1;
});
