import { describe, expect, it } from 'vitest';

import {
  describeFirstFormError,
  flattenFieldErrors,
  getFirstErrorTranslationLocale,
  splitTranslationField,
} from '@/shared/ui/form-error-message';

describe('splitTranslationField', () => {
  it('detects locale suffixes on leaf names', () => {
    expect(splitTranslationField('nameHy')).toEqual({ basePath: 'name', locale: 'hy' });
    expect(splitTranslationField('titleEn')).toEqual({ basePath: 'title', locale: 'en' });
    expect(splitTranslationField('catalog.sloganRu')).toEqual({
      basePath: 'slogan',
      locale: 'ru',
    });
  });

  it('leaves unlocalized paths unchanged', () => {
    expect(splitTranslationField('slug')).toEqual({ basePath: 'slug', locale: null });
    expect(splitTranslationField('coverMediaId')).toEqual({
      basePath: 'coverMediaId',
      locale: null,
    });
  });
});

describe('flattenFieldErrors', () => {
  it('reads a leaf field error', () => {
    expect(
      flattenFieldErrors({
        nameHy: { type: 'too_small', message: 'Required' },
      }),
    ).toEqual([{ path: 'nameHy', type: 'too_small', message: 'Required' }]);
  });

  it('walks nested objects', () => {
    const flat = flattenFieldErrors({
      catalog: { sloganHy: { type: 'too_big', message: 'Too long' } },
    });
    expect(flat).toEqual([{ path: 'catalog.sloganHy', type: 'too_big', message: 'Too long' }]);
  });
});

describe('describeFirstFormError', () => {
  const labels = { name: 'Name', slug: 'Slug', title: 'Title' };

  it('maps empty Armenian name to required-in-language', () => {
    expect(
      describeFirstFormError({ nameHy: { type: 'too_small', message: '' } }, labels),
    ).toEqual({ kind: 'requiredInLanguage', field: 'Name', language: 'hy' });
  });

  it('maps a required unlocalized field', () => {
    expect(
      describeFirstFormError({ slug: { type: 'required', message: '' } }, labels),
    ).toEqual({ kind: 'required', field: 'Slug' });
  });

  it('falls back to generic without a label', () => {
    expect(describeFirstFormError({ unknown: { type: 'too_small', message: '' } }, {})).toEqual({
      kind: 'generic',
    });
  });

  it('uses a root server message as-is', () => {
    expect(
      describeFirstFormError({ root: { type: 'server', message: 'Email is taken' } }, {}),
    ).toEqual({ kind: 'raw', message: 'Email is taken' });
  });
});

describe('getFirstErrorTranslationLocale', () => {
  it('returns the locale of the first translation error', () => {
    expect(
      getFirstErrorTranslationLocale({ titleHy: { type: 'too_small', message: '' } }),
    ).toBe('hy');
  });

  it('returns null when the first error is not localized', () => {
    expect(getFirstErrorTranslationLocale({ name: { type: 'too_small', message: '' } })).toBe(
      null,
    );
  });
});
