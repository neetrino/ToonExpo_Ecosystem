'use client';

import {
  BANK_PARTNER_OFFER_FINANCE_KEYS,
  type BankPartnerOfferFinanceKey,
} from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import type { UseFormRegister } from 'react-hook-form';

import { TRANSLATION_LOCALES } from '@/features/builder/constants';
import { getCatalogFieldPlaceholder } from '@/features/builder/constants/project-content-placeholders';
import { TranslationTabs } from '@/features/builder/components/translation-tabs';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

type Locale = (typeof TRANSLATION_LOCALES)[number];

type FinanceFieldsFormShape = {
  fields: Record<
    BankPartnerOfferFinanceKey,
    { hy: string; ru: string; en: string }
  >;
};

type BankPartnerOfferFinanceFieldsEditorProps = {
  register: UseFormRegister<FinanceFieldsFormShape>;
};

const TEXTAREA_KEYS = new Set<BankPartnerOfferFinanceKey>([
  'paymentTypes',
  'installmentTerms',
  'mortgageTerms',
  'specialTerms',
  'specialTermsAvailable',
  'incomeTaxRefund',
  'subsidizedPrograms',
]);

/**
 * Localized finance fields matching project catalog Finance section keys.
 */
export const BankPartnerOfferFinanceFieldsEditor = ({
  register,
}: BankPartnerOfferFinanceFieldsEditorProps) => {
  const tCatalog = useTranslations('Catalog.projectDetail.catalog');

  return (
    <TranslationTabs>
      {(locale: Locale) => (
        <div className="flex flex-col gap-3">
          {BANK_PARTNER_OFFER_FINANCE_KEYS.map((key) => {
            const fieldId = `finance-${key}-${locale}`;
            const label = tCatalog(key);
            const placeholder = getCatalogFieldPlaceholder(locale, key);
            const isTextarea = TEXTAREA_KEYS.has(key);
            return (
              <FormField key={fieldId} id={fieldId} label={label}>
                {isTextarea ? (
                  <Textarea
                    id={fieldId}
                    rows={3}
                    placeholder={placeholder}
                    {...register(`fields.${key}.${locale}`)}
                  />
                ) : (
                  <Input
                    id={fieldId}
                    type="text"
                    placeholder={placeholder}
                    {...register(`fields.${key}.${locale}`)}
                  />
                )}
              </FormField>
            );
          })}
        </div>
      )}
    </TranslationTabs>
  );
};
