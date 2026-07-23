'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { CreateCompanyRequest } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { COMPANY_TYPES } from '@/features/admin/constants';
import { useCreateAdminCompanyMutation } from '@/features/admin/hooks/use-admin-companies';
import {
  createCompanySchema,
  type CreateCompanyFormValues,
} from '@/features/admin/schemas/create-company.schema';
import { ApiError } from '@/shared/api/errors';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';

type CreateCompanyFormProps = {
  onSuccess: (adminEmail: string) => void;
};

const mapCreateError = (error: unknown): 'emailTaken' | 'generic' => {
  if (error instanceof ApiError && error.status === 409) {
    return 'emailTaken';
  }
  return 'generic';
};

/**
 * Form to provision a company and invite the first company_admin.
 */
export const CreateCompanyForm = ({ onSuccess }: CreateCompanyFormProps) => {
  const t = useTranslations('Admin.companies');
  const locale = useLocale();
  const createMutation = useCreateAdminCompanyMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCompanyFormValues>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: '',
      type: 'builder',
      description: '',
      adminName: '',
      adminEmail: '',
      adminPhone: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const body: CreateCompanyRequest = {
      name: values.name,
      type: values.type,
      adminName: values.adminName,
      adminEmail: values.adminEmail,
      locale,
      ...(values.description.length > 0 ? { description: values.description } : {}),
      ...(values.adminPhone.length > 0 ? { adminPhone: values.adminPhone } : {}),
    };

    try {
      await createMutation.mutateAsync(body);
      onSuccess(values.adminEmail);
    } catch (error) {
      setFormError(t(`errors.${mapCreateError(error)}`));
    }
  });

  const busy = isSubmitting || createMutation.isPending;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2.5 text-xs font-semibold tracking-wide text-ink-muted uppercase">
          {t('form.companySection')}
        </legend>
        <FormField
          id="company-name"
          label={t('form.name')}
          error={errors.name ? t('validation.name') : undefined}
        >
          <Input id="company-name" aria-invalid={Boolean(errors.name)} {...register('name')} />
        </FormField>
        <FormField
          id="company-type"
          label={t('form.type')}
          error={errors.type ? t('validation.type') : undefined}
        >
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                id="company-type"
                name={field.name}
                value={field.value}
                aria-label={t('form.type')}
                aria-invalid={Boolean(errors.type)}
                onBlur={field.onBlur}
                onChange={(event) => {
                  field.onChange(event.target.value);
                }}
              >
                {COMPANY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`types.${type}`)}
                  </option>
                ))}
              </Select>
            )}
          />
        </FormField>
        <FormField
          id="company-description"
          label={t('form.description')}
          error={errors.description ? t('validation.description') : undefined}
        >
          <textarea
            id="company-description"
            rows={2}
            className="w-full rounded-sm border border-border bg-background px-4 py-2.5 text-sm text-ink focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
            {...register('description')}
          />
        </FormField>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2.5 text-xs font-semibold tracking-wide text-ink-muted uppercase">
          {t('form.adminSection')}
        </legend>
        <FormField
          id="admin-name"
          label={t('form.adminName')}
          error={errors.adminName ? t('validation.adminName') : undefined}
        >
          <Input
            id="admin-name"
            aria-invalid={Boolean(errors.adminName)}
            {...register('adminName')}
          />
        </FormField>
        <FormField
          id="admin-email"
          label={t('form.adminEmail')}
          error={errors.adminEmail ? t('validation.adminEmail') : undefined}
        >
          <Input
            id="admin-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.adminEmail)}
            {...register('adminEmail')}
          />
        </FormField>
        <FormField
          id="admin-phone"
          label={t('form.adminPhone')}
          error={errors.adminPhone ? t('validation.adminPhone') : undefined}
        >
          <Input
            id="admin-phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.adminPhone)}
            {...register('adminPhone')}
          />
        </FormField>
      </fieldset>

      {formError ? (
        <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2 text-sm text-danger">
          {formError}
        </p>
      ) : null}

      <Button type="submit" variant="primary" disabled={busy}>
        {busy ? t('form.submitting') : t('form.submit')}
      </Button>
    </form>
  );
};
