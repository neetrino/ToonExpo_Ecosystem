'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  TranslationTabs,
  type TranslationLocale,
} from '@/features/builder/components/translation-tabs';
import { PARTNER_PUBLICATION_STATUSES } from '@/features/partners/constants';
import {
  partnerOfferSchema,
  type PartnerOfferFormValues,
} from '@/features/partners/schemas/partner.schema';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { useFormErrorToast } from '@/shared/ui/use-form-error-toast';

type PartnerOfferFormProps = {
  defaultValues: PartnerOfferFormValues;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (values: PartnerOfferFormValues) => Promise<void>;
  isBusy: boolean;
};

/**
 * Create/edit form for a partner offer with required Armenian title.
 */
export const PartnerOfferForm = ({
  defaultValues,
  submitLabel,
  onCancel,
  onSubmit,
  isBusy,
}: PartnerOfferFormProps) => {
  const t = useTranslations('Partners.offers');
  const [focusLocale, setFocusLocale] = useState<TranslationLocale | undefined>();
  const [focusTick, setFocusTick] = useState(0);
  const { onInvalid, errorToast } = useFormErrorToast({
    fieldLabels: { title: t('fields.title') },
    onTranslationError: (locale) => {
      setFocusLocale(locale);
      setFocusTick((tick) => tick + 1);
    },
  });
  const form = useForm<PartnerOfferFormValues>({
    resolver: zodResolver(partnerOfferSchema),
    defaultValues,
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  }, onInvalid);

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <TranslationTabs focusLocale={focusLocale} focusTick={focusTick}>
        {(locale) => (
          <div className="flex flex-col gap-4">
            <FormField
              id={`offer-title-${locale}`}
              label={t('fields.title')}
              error={
                locale === 'hy' && form.formState.errors.titleHy ? t('validation.title') : undefined
              }
            >
              <Input
                id={`offer-title-${locale}`}
                {...form.register(
                  locale === 'hy' ? 'titleHy' : locale === 'ru' ? 'titleRu' : 'titleEn',
                )}
              />
            </FormField>
            <FormField id={`offer-desc-${locale}`} label={t('fields.description')}>
              <Textarea
                id={`offer-desc-${locale}`}
                rows={4}
                {...form.register(
                  locale === 'hy'
                    ? 'descriptionHy'
                    : locale === 'ru'
                      ? 'descriptionRu'
                      : 'descriptionEn',
                )}
              />
            </FormField>
          </div>
        )}
      </TranslationTabs>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="offerPublication" label={t('fields.publication')}>
          <Controller
            name="publicationStatus"
            control={form.control}
            render={({ field }) => (
              <Select
                id="offerPublication"
                name={field.name}
                value={field.value}
                aria-label={t('fields.publication')}
                onBlur={field.onBlur}
                onChange={(event) => {
                  field.onChange(event.target.value);
                }}
              >
                {PARTNER_PUBLICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {t(`publication.${status}`)}
                  </option>
                ))}
              </Select>
            )}
          />
        </FormField>
        <FormField id="offerSort" label={t('fields.sortOrder')}>
          <Input
            id="offerSort"
            type="number"
            min={0}
            max={9999}
            {...form.register('sortOrder', { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={isBusy || form.formState.isSubmitting}>
          {submitLabel}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          {t('cancel')}
        </Button>
      </div>
      {errorToast}
    </form>
  );
};
