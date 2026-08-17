'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  BANK_PARTNER_OFFER_FINANCE_KEYS,
  type BankPartnerOfferFinanceFields,
  type BankPartnerOfferTemplateItem,
} from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

import { BankPartnerOfferFinanceFieldsEditor } from '@/features/admin/components/bank-partner-offer-finance-fields-editor';
import {
  bankPartnerOfferTemplateFormSchema,
  emptyFinanceFields,
  emptyLocaleText,
  type BankPartnerOfferTemplateFormValues,
} from '@/features/admin/schemas/bank-partner-offer-template.schema';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';

type TemplateSubmitBody = {
  name: string;
  fields: BankPartnerOfferFinanceFields;
};

type BankPartnerOfferTemplateFormProps = {
  initial?: BankPartnerOfferTemplateItem | undefined;
  onCreate?: ((body: TemplateSubmitBody) => Promise<void>) | undefined;
  onUpdate?: ((body: TemplateSubmitBody) => Promise<void>) | undefined;
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
        }
      : {
          name: '',
          fields: emptyFinanceFields(),
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
