'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { CompanyResponse } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';

import { useCreatePartnerMutation } from '@/features/admin/hooks/use-admin-partners';
import { PARTNER_COMPANY_TYPES } from '@/features/partners/constants';
import {
  createPartnerSchema,
  type CreatePartnerFormValues,
} from '@/features/partners/schemas/partner.schema';
import { toCreatePartnerBody } from '@/features/partners/utils/partner-mappers';
import { useRouter } from '@/i18n/navigation';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';

type CreatePartnerSheetProps = {
  open: boolean;
  companies: CompanyResponse[];
  onClose: () => void;
};

/**
 * Compact side sheet to create a partner profile for an existing company.
 */
export const CreatePartnerSheet = ({ open, companies, onClose }: CreatePartnerSheetProps) => {
  const t = useTranslations('Admin.partners.create');
  const router = useRouter();
  const mutation = useCreatePartnerMutation();

  const compatibleCompanies = companies.filter((company) =>
    ['partner', 'bank', 'service'].includes(company.type),
  );

  const form = useForm<CreatePartnerFormValues>({
    resolver: zodResolver(createPartnerSchema),
    defaultValues: {
      companyId: '',
      type: 'other',
      name: '',
      slug: '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await mutation.mutateAsync(toCreatePartnerBody(values));
      onClose();
      form.reset();
      router.push(`/admin/partners/${result.id}`);
    } catch {
      form.setError('root', { message: t('errors.generic') });
    }
  });

  const handleClose = (): void => {
    onClose();
    form.reset();
  };

  return (
    <AdminCreateSheet open={open} onClose={handleClose} title={t('title')}>
      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <FormField
          id="companyId"
          label={t('company')}
          error={form.formState.errors.companyId ? t('validation.company') : undefined}
        >
          <Controller
            name="companyId"
            control={form.control}
            render={({ field }) => (
              <Select
                id="companyId"
                name={field.name}
                value={field.value}
                aria-label={t('company')}
                onBlur={field.onBlur}
                onChange={(event) => {
                  field.onChange(event.target.value);
                }}
              >
                <option value="">{t('selectCompany')}</option>
                {compatibleCompanies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </Select>
            )}
          />
        </FormField>

        <FormField id="type" label={t('type')}>
          <Controller
            name="type"
            control={form.control}
            render={({ field }) => (
              <Select
                id="type"
                name={field.name}
                value={field.value}
                aria-label={t('type')}
                onBlur={field.onBlur}
                onChange={(event) => {
                  field.onChange(event.target.value);
                }}
              >
                {PARTNER_COMPANY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`types.${type}`)}
                  </option>
                ))}
              </Select>
            )}
          />
        </FormField>

        <FormField
          id="name"
          label={t('name')}
          error={form.formState.errors.name ? t('validation.name') : undefined}
        >
          <Input id="name" {...form.register('name')} />
        </FormField>

        <FormField id="slug" label={t('slug')}>
          <Input id="slug" {...form.register('slug')} />
          <p className="mt-1 text-xs text-ink-muted">{t('slugHint')}</p>
        </FormField>

        {form.formState.errors.root?.message ? (
          <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2 text-sm text-danger">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        <Button type="submit" variant="primary" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? t('submitting') : t('submit')}
        </Button>
      </form>
    </AdminCreateSheet>
  );
};
