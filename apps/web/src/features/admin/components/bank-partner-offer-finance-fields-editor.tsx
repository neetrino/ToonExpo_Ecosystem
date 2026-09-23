'use client';

import {
  BANK_PARTNER_OFFER_FINANCE_KEYS,
  BANK_PARTNER_OFFER_STATIC_KEYS,
  type BankPartnerOfferFinanceKey,
} from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';
import type { Control, FieldPath, UseFormRegister } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import type { TRANSLATION_LOCALES } from '@/features/builder/constants';
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

type BankPartnerOfferFinanceFieldsEditorProps<T extends FinanceFieldsFormShape> = {
  register: UseFormRegister<T>;
  control: Control<T>;
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

const TRANSLATED_FINANCE_KEYS = BANK_PARTNER_OFFER_FINANCE_KEYS.filter(
  (key) => !(BANK_PARTNER_OFFER_STATIC_KEYS as readonly string[]).includes(key),
);

const shareLocaleText = (next: string): { hy: string; ru: string; en: string } => ({
  hy: next,
  ru: next,
  en: next,
});

/**
 * One input for finance values that do not change by language (parking price).
 */
const StaticFinanceFields = <T extends FinanceFieldsFormShape>({
  control,
}: {
  control: Control<T>;
}) => {
  const uiLocale = useLocale();
  const tCatalog = useTranslations('Catalog.projectDetail.catalog');

  return (
    <div className="flex flex-col gap-3">
      {BANK_PARTNER_OFFER_STATIC_KEYS.map((key) => {
        const fieldId = `finance-${key}`;
        return (
          <FormField key={key} id={fieldId} label={tCatalog(key)}>
            <Controller
              control={control}
              name={`fields.${key}` as FieldPath<T>}
              render={({ field }) => {
                const current = field.value as { hy: string };
                return (
                  <Input
                    id={fieldId}
                    type="text"
                    placeholder={getCatalogFieldPlaceholder(uiLocale, key)}
                    value={current.hy}
                    onBlur={field.onBlur}
                    onChange={(event) => field.onChange(shareLocaleText(event.target.value))}
                  />
                );
              }}
            />
          </FormField>
        );
      })}
    </div>
  );
};

/**
 * Localized finance fields matching project catalog Bank partner section keys.
 * Parking price is entered once and stored for every language.
 */
export const BankPartnerOfferFinanceFieldsEditor = <T extends FinanceFieldsFormShape>({
  register,
  control,
}: BankPartnerOfferFinanceFieldsEditorProps<T>) => {
  const tCatalog = useTranslations('Catalog.projectDetail.catalog');

  return (
    <div className="flex flex-col gap-4">
      <StaticFinanceFields control={control} />
      <TranslationTabs>
        {(locale: Locale) => (
          <div className="flex flex-col gap-3">
            {TRANSLATED_FINANCE_KEYS.map((key) => {
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
                      {...register(`fields.${key}.${locale}` as FieldPath<T>)}
                    />
                  ) : (
                    <Input
                      id={fieldId}
                      type="text"
                      placeholder={placeholder}
                      {...register(`fields.${key}.${locale}` as FieldPath<T>)}
                    />
                  )}
                </FormField>
              );
            })}
          </div>
        )}
      </TranslationTabs>
    </div>
  );
};
