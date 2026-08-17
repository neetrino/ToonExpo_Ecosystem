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

type BankPartnerOption = {
  partnerCompanyId: string;
  name: string;
};

type BankPartnerOfferTemplateFormProps = {
  bankPartners: BankPartnerOption[];
  initial?: BankPartnerOfferTemplateItem | undefined;
  onCreate?: ((body: {
    partnerCompanyId: string;
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
 * Admin create/edit form for bank partner offer templates.
 */
export const BankPartnerOfferTemplateForm = ({
  bankPartners,
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
          partnerCompanyId: initial.partnerCompanyId,
          name: initial.name,
          fields: toFormFields(initial.fields),
          publicationStatus: initial.publicationStatus,
          sortOrder: initial.sortOrder,
        }
      : {
          partnerCompanyId: bankPartners[0]?.partnerCompanyId ?? '',
          name: '',
          fields: emptyFinanceFields(),
          publicationStatus: 'draft',
          sortOrder: 0,
        },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    if (isEdit) {
      await onUpdate?.({
        name: values.name,
        fields: values.fields,
        publicationStatus: values.publicationStatus,
        sortOrder: values.sortOrder,
      });
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
        {!isEdit ? (
          <FormField id="partnerCompanyId" label={t('bankPartner')}>
            <Controller
              name="partnerCompanyId"
              control={form.control}
              render={({ field }) => (
                <Select
                  id="partnerCompanyId"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={busy || bankPartners.length === 0}
                >
                  {bankPartners.map((partner) => (
                    <option key={partner.partnerCompanyId} value={partner.partnerCompanyId}>
                      {partner.name}
                    </option>
                  ))}
                </Select>
              )}
            />
          </FormField>
        ) : null}
        <FormField id="template-name" label={t('name')}>
          <Input id="template-name" disabled={busy} {...form.register('name')} />
        </FormField>
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
