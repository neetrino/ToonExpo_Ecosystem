import { describe, expect, it } from 'vitest';

import { emptyCompanyCopyValues } from '@/features/admin/schemas/company-copy-fields.schema';
import {
  buildCompanyTranslations,
  companyCopyDefaultsFrom,
  toCompanyCopyRequest,
} from '@/features/admin/utils/company-copy-mappers';
import type { CompanyResponse } from '@toonexpo/contracts';

const copyValues = {
  ...emptyCompanyCopyValues(),
  nameHy: 'Հայկական անուն',
  nameRu: 'Русское имя',
  nameEn: 'English name',
  shortDescriptionHy: 'կարճ',
  descriptionEn: 'Full English bio',
};

describe('buildCompanyTranslations', () => {
  it('omits empty locales', () => {
    expect(buildCompanyTranslations(copyValues)).toEqual({
      name: {
        hy: 'Հայկական անուն',
        ru: 'Русское имя',
        en: 'English name',
      },
      shortDescription: { hy: 'կարճ' },
      description: { en: 'Full English bio' },
    });
  });
});

describe('toCompanyCopyRequest', () => {
  it('uses Armenian copy as canonical scalars', () => {
    expect(toCompanyCopyRequest(copyValues)).toEqual({
      name: 'Հայկական անուն',
      shortDescription: 'կարճ',
      translations: {
        name: {
          hy: 'Հայկական անուն',
          ru: 'Русское имя',
          en: 'English name',
        },
        shortDescription: { hy: 'կարճ' },
        description: { en: 'Full English bio' },
      },
    });
  });
});

describe('companyCopyDefaultsFrom', () => {
  it('falls back to scalar fields when translations are missing', () => {
    const company = {
      name: 'Scalar Co',
      description: 'Scalar description',
      shortDescription: 'Scalar short',
    } as CompanyResponse;

    expect(companyCopyDefaultsFrom(company)).toEqual({
      ...emptyCompanyCopyValues(),
      nameHy: 'Scalar Co',
      descriptionHy: 'Scalar description',
      shortDescriptionHy: 'Scalar short',
    });
  });
});
