import {
  BANK_PARTNER_OFFER_FINANCE_KEYS,
  type BankPartnerOfferFinanceFields,
  type BankPartnerOfferFinanceKey,
  type ProjectBankPartnerOfferSummary,
} from '@toonexpo/contracts';

import {
  PROJECT_CATALOG_BANK_PARTNER_CRITERION_IDS,
  type ProjectCatalogRow,
} from '@/features/catalog/utils/build-project-catalog-rows';

type SupportedLocale = 'hy' | 'ru' | 'en';

type BankPartnerOfferFieldLabels = Record<
  (typeof PROJECT_CATALOG_BANK_PARTNER_CRITERION_IDS)[number],
  string
>;

const resolveLocaleText = (
  text: { hy: string; ru: string; en: string } | undefined,
  locale: SupportedLocale,
): string | null => {
  if (!text) {
    return null;
  }
  const value = text[locale]?.trim() || text.en?.trim() || text.hy?.trim() || text.ru?.trim();
  return value && value.length > 0 ? value : null;
};

const resolveOfferField = (
  fields: BankPartnerOfferFinanceFields,
  key: BankPartnerOfferFinanceKey,
  locale: SupportedLocale,
): string | null => resolveLocaleText(fields[key], locale);

/**
 * Build display rows for one project bank partner offer (public catalog).
 */
export const buildProjectBankPartnerOfferRows = (
  offer: ProjectBankPartnerOfferSummary,
  locale: SupportedLocale,
  labels: BankPartnerOfferFieldLabels,
): ProjectCatalogRow[] => {
  const rows: ProjectCatalogRow[] = [];

  for (const key of BANK_PARTNER_OFFER_FINANCE_KEYS) {
    if (!(PROJECT_CATALOG_BANK_PARTNER_CRITERION_IDS as readonly string[]).includes(key)) {
      continue;
    }
    const value = resolveOfferField(offer.fields, key, locale);
    if (!value) {
      continue;
    }
    rows.push({
      id: key,
      label: labels[key as keyof BankPartnerOfferFieldLabels],
      value,
      wide: key === 'specialTerms',
    });
  }

  return rows;
};
