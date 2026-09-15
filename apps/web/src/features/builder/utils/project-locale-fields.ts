import type { TRANSLATION_LOCALES } from '@/features/builder/constants';

type ContentLocale = (typeof TRANSLATION_LOCALES)[number];

export const PROJECT_LOCALE_FIELDS = {
  name: { hy: 'nameHy', ru: 'nameRu', en: 'nameEn' },
  shortDescription: {
    hy: 'shortDescriptionHy',
    ru: 'shortDescriptionRu',
    en: 'shortDescriptionEn',
  },
  fullDescription: {
    hy: 'fullDescriptionHy',
    ru: 'fullDescriptionRu',
    en: 'fullDescriptionEn',
  },
  locationText: { hy: 'locationTextHy', ru: 'locationTextRu', en: 'locationTextEn' },
  district: { hy: 'districtHy', ru: 'districtRu', en: 'districtEn' },
} as const;

export const projectLocaleField = <K extends keyof typeof PROJECT_LOCALE_FIELDS>(
  field: K,
  locale: ContentLocale,
): (typeof PROJECT_LOCALE_FIELDS)[K][ContentLocale] => PROJECT_LOCALE_FIELDS[field][locale];
