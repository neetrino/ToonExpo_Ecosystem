'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  BANK_PARTNER_OFFER_FINANCE_KEYS,
  type BankPartnerOfferFinanceFields,
  type ProjectBankPartnerOfferItem,
} from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

import { BankPartnerOfferFinanceFieldsEditor } from '@/features/admin/components/bank-partner-offer-finance-fields-editor';
import {
  emptyFinanceFields,
  emptyLocaleText,
  projectBankPartnerOfferFormSchema,
  type ProjectBankPartnerOfferFormValues,
} from '@/features/admin/schemas/bank-partner-offer-template.schema';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';

type ProjectBankPartnerOfferEditFormProps = {
  initial: ProjectBankPartnerOfferItem;
  isBusy: boolean;
  onSave: (body: {
    name: string;
    fields: BankPartnerOfferFinanceFields;
    sortOrder: number;
  }) => Promise<void>;
  onCancel: () => void;
};

const toFormFields = (
  fields: BankPartnerOfferFinanceFields,
): ProjectBankPartnerOfferFormValues['fields'] => {
  const next = emptyFinanceFields();
  for (const key of BANK_PARTNER_OFFER_FINANCE_KEYS) {
    next[key] = { ...emptyLocaleText(), ...fields[key] };
  }
  return next;
};

/**
 * Edit a project-scoped bank partner offer copy.
 */
export const ProjectBankPartnerOfferEditForm = ({
  initial,
  isBusy,
  onSave,
  onCancel,
}: ProjectBankPartnerOfferEditFormProps) => {
  const t = useTranslations('Builder.projects.bankPartnerOffers.form');
  const form = useForm<ProjectBankPartnerOfferFormValues>({
    resolver: zodResolver(projectBankPartnerOfferFormSchema),
    defaultValues: {
      name: initial.name,
      fields: toFormFields(initial.fields),
      sortOrder: initial.sortOrder,
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSave(values);
  });

  const busy = isBusy || form.formState.isSubmitting;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <FormField id="project-offer-name" label={t('name')}>
        <Input id="project-offer-name" disabled={busy} {...form.register('name')} />
      </FormField>
      <BankPartnerOfferFinanceFieldsEditor register={form.register} />
      <FormField id="project-offer-sort" label={t('sortOrder')}>
        <Input
          id="project-offer-sort"
          type="number"
          disabled={busy}
          {...form.register('sortOrder', { valueAsNumber: true })}
        />
      </FormField>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="secondary" disabled={busy}>
          {busy ? t('saving') : t('save')}
        </Button>
        <Button type="button" variant="ghost" disabled={busy} onClick={onCancel}>
          {t('cancel')}
        </Button>
      </div>
    </form>
  );
};
