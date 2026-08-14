import { describe, expect, it } from 'vitest';

import {
  resolveCompanyDisplayDescription,
  resolveCompanyDisplayName,
  resolveTranslatedValue,
  TRANSLATION_ENTITY,
  TRANSLATION_FIELD,
  type TranslationRow,
} from './resolve-translation.js';

const rows: TranslationRow[] = [
  {
    entityType: TRANSLATION_ENTITY.project,
    entityId: 'p1',
    fieldName: TRANSLATION_FIELD.name,
    locale: 'hy',
    value: 'Հյուսիսային պողոտա',
  },
  {
    entityType: TRANSLATION_ENTITY.project,
    entityId: 'p1',
    fieldName: TRANSLATION_FIELD.name,
    locale: 'ru',
    value: 'Северный проспект',
  },
  {
    entityType: TRANSLATION_ENTITY.project,
    entityId: 'p1',
    fieldName: TRANSLATION_FIELD.name,
    locale: 'en',
    value: 'Northern Avenue',
  },
];

describe('resolveTranslatedValue', () => {
  it('returns the requested locale when present', () => {
    expect(
      resolveTranslatedValue(
        rows,
        TRANSLATION_ENTITY.project,
        'p1',
        TRANSLATION_FIELD.name,
        'ru',
        'scalar',
      ),
    ).toBe('Северный проспект');
  });

  it('returns null for non-hy locale when that locale is missing', () => {
    const withoutEn = rows.filter((row) => row.locale !== 'en');
    expect(
      resolveTranslatedValue(
        withoutEn,
        TRANSLATION_ENTITY.project,
        'p1',
        TRANSLATION_FIELD.name,
        'en',
        'scalar',
      ),
    ).toBeNull();
  });

  it('uses scalar fallback only for Armenian locale', () => {
    expect(
      resolveTranslatedValue(
        [],
        TRANSLATION_ENTITY.project,
        'p1',
        TRANSLATION_FIELD.name,
        'hy',
        'Հյուսիսային պողոտա',
      ),
    ).toBe('Հյուսիսային պողոտա');

    expect(
      resolveTranslatedValue(
        [],
        TRANSLATION_ENTITY.project,
        'p1',
        TRANSLATION_FIELD.name,
        'ru',
        'Northern Avenue Residences',
      ),
    ).toBeNull();
  });

  it('returns null when neither translation nor scalar exists', () => {
    expect(
      resolveTranslatedValue(
        [],
        TRANSLATION_ENTITY.project,
        'p1',
        TRANSLATION_FIELD.description,
        'hy',
        null,
      ),
    ).toBeNull();
  });
});

describe('resolveCompanyDisplayName', () => {
  const companyRows: TranslationRow[] = [
    {
      entityType: TRANSLATION_ENTITY.company,
      entityId: 'c1',
      fieldName: TRANSLATION_FIELD.name,
      locale: 'en',
      value: 'Silva Development',
    },
  ];

  it('uses the locale translation when present', () => {
    expect(resolveCompanyDisplayName(companyRows, 'c1', 'en', 'Սիլվա')).toBe('Silva Development');
  });

  it('falls back to the scalar company name when the locale has no text', () => {
    expect(resolveCompanyDisplayName([], 'c1', 'en', 'Neetrinoo')).toBe('Neetrinoo');
  });

  it('falls back to the scalar name when the locale row is blank', () => {
    expect(
      resolveCompanyDisplayName(
        [
          {
            entityType: TRANSLATION_ENTITY.company,
            entityId: 'c1',
            fieldName: TRANSLATION_FIELD.name,
            locale: 'en',
            value: '   ',
          },
        ],
        'c1',
        'en',
        'Neetrinoo',
      ),
    ).toBe('Neetrinoo');
  });
});

describe('resolveCompanyDisplayDescription', () => {
  it('falls back to the scalar description when the locale has no text', () => {
    expect(
      resolveCompanyDisplayDescription([], 'c1', 'en', 'Premium residential developer'),
    ).toBe('Premium residential developer');
  });

  it('returns null when both translation and scalar are empty', () => {
    expect(resolveCompanyDisplayDescription([], 'c1', 'en', null)).toBeNull();
  });
});
