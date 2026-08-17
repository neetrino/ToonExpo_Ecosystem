'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  BANK_PARTNER_OFFER_FINANCE_KEYS,
  type BankPartnerOfferFinanceFields,
  type BankPartnerOfferTemplateItem,
} from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';

import { BankPartnerOfferFinanceFieldsEditor } from '@/features/admin/components/bank-partner-offer-finance-fields-editor';
import {
  bankPartnerOfferTemplateFormSchema,
  emptyFinanceFields,
  emptyLocaleText,
  type BankPartnerOfferTemplateFormValues,
} from '@/features/admin/schemas/bank-partner-offer-template.schema';
import { PARTNER_PUBLICATION_STATUSES } from '@/features/partners/constants';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';

type BankPartnerOfferTemplateFormProps = {
  initial?: BankPartnerOfferTemplateItem | undefined;
  onCreate?: ((body: {
    name: string;
    fields: BankPartnerOfferFinanceFields;
    publicationStatus: BankPartnerOfferTemplateFormValues['publicationStatus'];
    sortOrder: number;
  }) => Promise<void>) | undefined;
  onUpdate?: ((body: {
    name: string;
    fields: BankPartnerOfferFinanceFields;
    publicationStatus: BankPartnerOfferTemplateFormValues['publicationStatus'];
    sortOrder: number;
  }) => Promise<void>) | undefined;
  onCancel: () => void;
  isBusy: boolean;
};

const toFormFields = (
  fields: BankPartnerOfferFinanceFields,
): BankPartnerOfferTemplateFormValues['fields'] => {
  const next = emptyFinanceFields();
  for (const key of BANK_PARTNER_OFFER_FINANCE_KEYS) {
    next[key] = {
      ...emptyLocaleText(),
      ...fields[key],
    };
  }
  return next;
};

/**
 * Admin create/edit form for reusable finance templates (name + Finance fields).
 */
export const BankPartnerOfferTemplateForm = ({
  initial,
  onCreate,
  onUpdate,
  onCancel,
  isBusy,
}: BankPartnerOfferTemplateFormProps) => {
  const t = useTranslations('Admin.templates.form');
  const isEdit = initial != null;

  const form = useForm<BankPartnerOfferTemplateFormValues>({
    resolver: zodResolver(bankPartnerOfferTemplateFormSchema),
    defaultValues: initial
      ? {
          name: initial.name,
          fields: toFormFields(initial.fields),
          publicationStatus: initial.publicationStatus,
          sortOrder: initial.sortOrder,
        }
      : {
          name: '',
          fields: emptyFinanceFields(),
          publicationStatus: 'draft',
          sortOrder: 0,
        },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    if (isEdit) {
      await onUpdate?.(values);
      return;
    }
    await onCreate?.(values);
  });

  const busy = isBusy || form.formState.isSubmitting;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2.5 text-xs font-semibold tracking-wide text-ink-muted uppercase">
          {t('sections.template')}
        </legend>
        <FormField id="template-name" label={t('name')}>
          <Input
            id="template-name"
            placeholder={t('namePlaceholder')}
            disabled={busy}
            {...form.register('name')}
          />
        </FormField>
        <p className="text-xs text-ink-muted">{t('nameHint')}</p>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2.5 text-xs font-semibold tracking-wide text-ink-muted uppercase">
          {t('sections.finance')}
        </legend>
        <BankPartnerOfferFinanceFieldsEditor register={form.register} />
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2.5 text-xs font-semibold tracking-wide text-ink-muted uppercase">
          {t('sections.publishing')}
        </legend>
        <FormField id="publicationStatus" label={t('publication')}>
          <Controller
            name="publicationStatus"
            control={form.control}
            render={({ field }) => (
              <Select
                id="publicationStatus"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={busy}
              >
                {PARTNER_PUBLICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {t(`publicationStatuses.${status}`)}
                  </option>
                ))}
              </Select>
            )}
          />
        </FormField>
        <FormField id="sortOrder" label={t('sortOrder')}>
          <Input
            id="sortOrder"
            type="number"
            disabled={busy}
            {...form.register('sortOrder', { valueAsNumber: true })}
          />
        </FormField>
      </fieldset>

      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="submit" variant="secondary" disabled={busy}>
          {busy ? t('saving') : isEdit ? t('save') : t('create')}
        </Button>
        <Button type="button" variant="ghost" disabled={busy} onClick={onCancel}>
          {t('cancel')}
        </Button>
      </div>
    </form>
  );
};
