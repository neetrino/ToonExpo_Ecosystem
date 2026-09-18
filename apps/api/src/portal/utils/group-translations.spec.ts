import { describe, expect, it } from 'vitest';

import { TRANSLATION_FIELD } from '../../catalog/utils/resolve-translation.js';
import { groupPortalTranslations } from './group-translations.js';

describe('groupPortalTranslations', () => {
  it('keeps projectType values per locale', () => {
    const grouped = groupPortalTranslations(
      [
        {
          entityType: 'project',
          entityId: 'p1',
          fieldName: TRANSLATION_FIELD.projectType,
          locale: 'hy',
          value: 'Բնակելի համալիր',
        },
        {
          entityType: 'project',
          entityId: 'p1',
          fieldName: TRANSLATION_FIELD.projectType,
          locale: 'en',
          value: 'Residential complex',
        },
      ],
      [TRANSLATION_FIELD.projectType],
    );

    expect(grouped.projectType).toEqual({
      hy: 'Բնակելի համալիր',
      en: 'Residential complex',
    });
    expect(grouped.projectType?.ru).toBeUndefined();
  });
});
