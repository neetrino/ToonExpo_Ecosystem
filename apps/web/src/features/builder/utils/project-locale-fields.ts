type ContentLocale = 'hy' | 'ru' | 'en';

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
) => PROJECT_LOCALE_FIELDS[field][locale];
