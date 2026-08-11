/**
 * Seeds platform home-hero MediaAssets + PlatformSetting slides JSON.
 *
 * Usage (repo root):
 *   pnpm exec node --env-file=.env scripts/seed-home-hero-setting.mjs
 *   pnpm exec node --env-file=.env scripts/seed-home-hero-setting.mjs --with-test-slide
 */
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const HOME_HERO_MEDIA_ID = 'media_platform_home_hero';
const HOME_HERO_TEST_MEDIA_ID = 'media_platform_home_hero_test';
const PLATFORM_SETTING_SLIDES_KEY = 'home.hero.slides';
const PLATFORM_SETTING_LEGACY_KEY = 'home.hero.mediaAssetId';

const DEFAULT_HERO_PATH = '/images/hero-building.webp';
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
      relatedEntityId: PLATFORM_SETTING_SLIDES_KEY,
    },
    update: {
      fileUrl,
      title,
      altText: title,
      type: 'image',
    },
  });
};

const setHomeHeroSlides = async (db, mediaAssetIds) => {
  await db.platformSetting.upsert({
    where: { key: PLATFORM_SETTING_SLIDES_KEY },
    create: {
      key: PLATFORM_SETTING_SLIDES_KEY,
      value: JSON.stringify(mediaAssetIds),
      valueType: 'json',
      description: 'Ordered media asset ids for the public home page hero banner carousel',
    },
    update: {
      value: JSON.stringify(mediaAssetIds),
      valueType: 'json',
    },
  });
  await db.platformSetting.deleteMany({
    where: { key: PLATFORM_SETTING_LEGACY_KEY },
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

  const withTestSlide = process.argv.includes('--with-test-slide');
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
      title: 'Home hero (carousel test)',
    });

    const slideIds = withTestSlide
      ? [HOME_HERO_MEDIA_ID, HOME_HERO_TEST_MEDIA_ID]
      : [HOME_HERO_MEDIA_ID];

    await setHomeHeroSlides(db, slideIds);
    const hero = await fetchPublicHero();
    console.log('[seed-home-hero] Public payload:', JSON.stringify(hero));
    if (!Array.isArray(hero.slides) || hero.slides.length !== slideIds.length) {
      throw new Error('Unexpected slides payload from API');
    }
    console.log(
      withTestSlide
        ? '[seed-home-hero] Seeded 2 slides (default + test) — Home will rotate every 5s.'
        : '[seed-home-hero] Seeded 1 slide (default hero-building.webp).',
    );
  } finally {
    await db.$disconnect();
  }
};

main().catch((error) => {
  console.error('[seed-home-hero] Failed:', error);
  process.exitCode = 1;
});
