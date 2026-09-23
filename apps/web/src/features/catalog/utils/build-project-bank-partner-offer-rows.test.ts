import { describe, expect, it } from 'vitest';

import { buildProjectBankPartnerOfferRows } from '@/features/catalog/utils/build-project-bank-partner-offer-rows';
import { PROJECT_CATALOG_BANK_PARTNER_CRITERION_IDS } from '@/features/catalog/utils/build-project-catalog-rows';

const labels = Object.fromEntries(
  PROJECT_CATALOG_BANK_PARTNER_CRITERION_IDS.map((id) => [id, id]),
) as Record<(typeof PROJECT_CATALOG_BANK_PARTNER_CRITERION_IDS)[number], string>;

describe('buildProjectBankPartnerOfferRows', () => {
  it('uses one parking price for every locale and keeps terms translated', () => {
    const offer = {
      id: 'offer-1',
      name: 'Mortgage',
      partnerCompanyName: null,
      partnerCompanyLogoUrl: null,
      sortOrder: 0,
      fields: {
        parkingPrice: { hy: '6000000', ru: '1', en: '2' },
        paymentTypes: { hy: 'Կանխիկ', ru: 'Наличные', en: 'Cash' },
      },
    };

    const ru = buildProjectBankPartnerOfferRows(offer, 'ru', labels);
    const en = buildProjectBankPartnerOfferRows(offer, 'en', labels);

    expect(ru.find((row) => row.id === 'parkingPrice')?.value).toBe('6000000');
    expect(en.find((row) => row.id === 'parkingPrice')?.value).toBe('6000000');
    expect(ru.find((row) => row.id === 'paymentTypes')?.value).toBe('Наличные');
    expect(en.find((row) => row.id === 'paymentTypes')?.value).toBe('Cash');
  });
});
