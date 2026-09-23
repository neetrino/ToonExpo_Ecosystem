import { describe, expect, it } from 'vitest';

import { parseProjectCatalog } from '@/features/catalog/utils/project-catalog-details';

describe('project catalog static fields', () => {
  it('shows one price on every locale and keeps translated copy per language', () => {
    const amenities = {
      details: {
        pricePerSqmMin: { hy: '420000', ru: '1', en: '2' },
        apartmentsCount: '12',
        slogan: { hy: 'Հայ', en: 'Live well' },
      },
    };

    const hy = parseProjectCatalog(amenities, null, 'hy');
    const ru = parseProjectCatalog(amenities, null, 'ru');
    const en = parseProjectCatalog(amenities, null, 'en');

    expect(hy.details.pricePerSqmMin).toBe('420000');
    expect(ru.details.pricePerSqmMin).toBe('420000');
    expect(en.details.pricePerSqmMin).toBe('420000');
    expect(ru.details.apartmentsCount).toBe('12');
    expect(en.details.apartmentsCount).toBe('12');
    expect(ru.details.slogan).toBeNull();
    expect(en.details.slogan).toBe('Live well');
  });
});
