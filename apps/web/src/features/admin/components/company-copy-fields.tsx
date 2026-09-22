'use client';

import type { ReactNode } from 'react';
import type { FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import {
  TranslationTabs,
  type TranslationLocale,
} from '@/features/builder/components/translation-tabs';
import {
  COMPANY_DESCRIPTION_MAX_LENGTH,
  COMPANY_SHORT_DESCRIPTION_MAX_LENGTH,
} from '@/features/admin/constants';
import type { CompanyCopyFieldsValues } from '@/features/admin/schemas/company-copy-fields.schema';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

type CompanyCopyFieldsProps<TFieldValues extends FieldValues> = {
  register: UseFormRegister<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  idPrefix: string;
  focusLocale?: TranslationLocale | undefined;
  focusTick?: number | undefined;
  /** Shared control shown beside the name (not per-locale). */
  nameAside?: ReactNode | undefined;
};

const COMPANY_LOCALE_FIELDS = {
  name: { hy: 'nameHy', ru: 'nameRu', en: 'nameEn' },
  shortDescription: {
    hy: 'shortDescriptionHy',
    ru: 'shortDescriptionRu',
    en: 'shortDescriptionEn',
  },
  description: {
    hy: 'descriptionHy',
    ru: 'descriptionRu',
    en: 'descriptionEn',
  },
} as const;

const field = <TFieldValues extends FieldValues>(
  name: keyof CompanyCopyFieldsValues,
): Path<TFieldValues> => name as Path<TFieldValues>;

const copyField = <TFieldValues extends FieldValues>(
  key: keyof typeof COMPANY_LOCALE_FIELDS,
  locale: TranslationLocale,
): Path<TFieldValues> => field(COMPANY_LOCALE_FIELDS[key][locale]);

/**
 * HY / RU / EN company name and description fields for admin create/edit sheets.
 */
export const CompanyCopyFields = <TFieldValues extends FieldValues>({
  register,
  errors,
  idPrefix,
  focusLocale,
  focusTick,
  nameAside,
}: CompanyCopyFieldsProps<TFieldValues>) => {
  const t = useTranslations('Admin.companies');
  const fieldErrors = errors as FieldErrors<CompanyCopyFieldsValues>;

  return (
    <TranslationTabs focusLocale={focusLocale} focusTick={focusTick}>
      {(locale, { isActive }) => (
        <div className="flex flex-col gap-4">
          <div
            className={
              nameAside ? 'grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start' : undefined
            }
          >
            <FormField
              id={`${idPrefix}-name-${locale}`}
              label={t('form.name')}
              error={locale === 'hy' && fieldErrors.nameHy ? t('validation.name') : undefined}
            >
              <Input
                id={`${idPrefix}-name-${locale}`}
                aria-invalid={Boolean(fieldErrors[COMPANY_LOCALE_FIELDS.name[locale]])}
                {...register(copyField<TFieldValues>('name', locale))}
              />
            </FormField>
            {nameAside && isActive ? nameAside : null}
          </div>
          <FormField
            id={`${idPrefix}-short-description-${locale}`}
            label={t('form.shortDescription')}
            error={
              fieldErrors[COMPANY_LOCALE_FIELDS.shortDescription[locale]]
                ? t('validation.shortDescription')
                : undefined
            }
          >
            <Textarea
              id={`${idPrefix}-short-description-${locale}`}
              rows={2}
              maxLength={COMPANY_SHORT_DESCRIPTION_MAX_LENGTH}
              className="min-h-20"
              aria-invalid={Boolean(fieldErrors[COMPANY_LOCALE_FIELDS.shortDescription[locale]])}
              aria-describedby={`${idPrefix}-short-description-hint-${locale}`}
              {...register(copyField<TFieldValues>('shortDescription', locale))}
            />
            <p
              id={`${idPrefix}-short-description-hint-${locale}`}
              className="text-xs text-ink-muted"
            >
              {t('form.shortDescriptionHint')}
            </p>
          </FormField>
          <FormField
            id={`${idPrefix}-description-${locale}`}
            label={t('form.description')}
            error={
              fieldErrors[COMPANY_LOCALE_FIELDS.description[locale]]
                ? t('validation.description')
                : undefined
            }
          >
            <Textarea
              id={`${idPrefix}-description-${locale}`}
              rows={3}
              maxLength={COMPANY_DESCRIPTION_MAX_LENGTH}
              className="min-h-24"
              aria-invalid={Boolean(fieldErrors[COMPANY_LOCALE_FIELDS.description[locale]])}
              aria-describedby={`${idPrefix}-description-hint-${locale}`}
              {...register(copyField<TFieldValues>('description', locale))}
            />
            <p id={`${idPrefix}-description-hint-${locale}`} className="text-xs text-ink-muted">
              {t('form.descriptionHint')}
            </p>
          </FormField>
        </div>
      )}
    </TranslationTabs>
  );
};
