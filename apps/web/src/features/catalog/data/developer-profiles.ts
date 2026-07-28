/**
 * Static public developer profiles (spreadsheet content).
 * Replace with API-backed Company fields when the builder profile schema lands.
 */

import { staticAssetUrl } from '@/shared/lib/static-asset-url';

export type DeveloperContentLocale = 'hy' | 'ru' | 'en';

export type DeveloperProfile = {
  slug: string;
  name: string;
  phone: string;
  contactPerson: string;
  email: string;
  projectCount: number;
  currentProjects: readonly string[];
  websiteUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  /** Optional displayed mark; when null, initials are shown. */
  logoUrl: string | null;
  /** Spreadsheet logo file link. */
  logoLinkUrl: string | null;
  region: string;
  address: string;
  mediaMaterialsUrl: string | null;
  promoMaterialsUrl: string | null;
  content: string | null;
};

const PLACEHOLDER_LINK = 'https://example.com';

const MYLER_PROFILE_BY_LOCALE: Record<DeveloperContentLocale, DeveloperProfile> = {
  hy: {
    slug: 'myler-ski-in-out',
    name: 'Մայլեռ Ski in Out Բնակելի Համալիր',
    phone: '374 44 01 55 22',
    contactPerson: 'Հասմիկ',
    email: 'parsllc55.22@gmail.com',
    projectCount: 5,
    currentProjects: [
      'Բիդեք Դավթաշեն',
      'Բիդեք Դավիթ Բեկ',
      'Բիդեք Աբովյան',
      'Բիդեք Մասիս',
      'Պարկ Լայն Ռեզիդենս',
    ],
    websiteUrl: PLACEHOLDER_LINK,
    instagramUrl: PLACEHOLDER_LINK,
    facebookUrl: PLACEHOLDER_LINK,
    logoUrl: staticAssetUrl('/demo/building-a.webp'),
    logoLinkUrl: PLACEHOLDER_LINK,
    region: 'Երևան',
    address: 'Սասունցի Դավիթ 87, ա շինություն',
    mediaMaterialsUrl: PLACEHOLDER_LINK,
    promoMaterialsUrl: PLACEHOLDER_LINK,
    content: null,
  },
  ru: {
    slug: 'myler-ski-in-out',
    name: 'Майлер Ski in Out Жилой комплекс',
    phone: '374 44 01 55 22',
    contactPerson: 'Асмик',
    email: 'parsllc55.22@gmail.com',
    projectCount: 5,
    currentProjects: [
      'Битекс Давташен',
      'Битекс Давид Бек',
      'Битекс Абовян',
      'Битекс Масис',
      'Парк Лейн Резиденс',
    ],
    websiteUrl: PLACEHOLDER_LINK,
    instagramUrl: PLACEHOLDER_LINK,
    facebookUrl: PLACEHOLDER_LINK,
    logoUrl: staticAssetUrl('/demo/building-a.webp'),
    logoLinkUrl: PLACEHOLDER_LINK,
    region: 'Ереван',
    address: 'Сасунци Давид 87, здание А',
    mediaMaterialsUrl: PLACEHOLDER_LINK,
    promoMaterialsUrl: PLACEHOLDER_LINK,
    content: null,
  },
  en: {
    slug: 'myler-ski-in-out',
    name: 'Myler Ski in Out Residential Complex',
    phone: '374 44 01 55 22',
    contactPerson: 'Hasmik',
    email: 'parsllc55.22@gmail.com',
    projectCount: 5,
    currentProjects: [
      'Bidex Davtashen',
      'Bidex David Bek',
      'Bidex Abovyan',
      'Bidex Masis',
      'Park Lane Residence',
    ],
    websiteUrl: PLACEHOLDER_LINK,
    instagramUrl: PLACEHOLDER_LINK,
    facebookUrl: PLACEHOLDER_LINK,
    logoUrl: staticAssetUrl('/demo/building-a.webp'),
    logoLinkUrl: PLACEHOLDER_LINK,
    region: 'Yerevan',
    address: 'Sasuntsi Davit 87, building A',
    mediaMaterialsUrl: PLACEHOLDER_LINK,
    promoMaterialsUrl: PLACEHOLDER_LINK,
    content: null,
  },
};

const DEVELOPER_SLUGS = ['myler-ski-in-out'] as const;

/**
 * Returns a localized developer profile by public slug, or null when unknown.
 */
export const getDeveloperProfile = (slug: string, locale: string): DeveloperProfile | null => {
  if (!DEVELOPER_SLUGS.includes(slug as (typeof DEVELOPER_SLUGS)[number])) {
    return null;
  }

  const contentLocale: DeveloperContentLocale = locale === 'ru' || locale === 'en' ? locale : 'hy';

  return MYLER_PROFILE_BY_LOCALE[contentLocale];
};

/** All known developer slugs (for static params / listing). */
export const listDeveloperSlugs = (): readonly string[] => DEVELOPER_SLUGS;
