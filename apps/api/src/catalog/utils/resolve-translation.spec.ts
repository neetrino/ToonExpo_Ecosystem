import { describe, expect, it } from 'vitest';

import {
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
