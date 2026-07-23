'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { CompanyResponse } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { COMPANY_STATUSES } from '@/features/admin/constants';
import { useUpdateAdminCompanyMutation } from '@/features/admin/hooks/use-admin-companies';
import {
  updateCompanySchema,
  type UpdateCompanyFormValues,
} from '@/features/admin/schemas/update-company.schema';
import { MediaUploadField } from '@/features/media/components/media-upload-field';
import { toNullableMediaId } from '@/features/media/schemas/media-fields.schema';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';

type EditCompanyFormProps = {
  company: CompanyResponse;
};

/**
 * Inline PATCH form for company name, description, and status.
 */
export const EditCompanyForm = ({ company }: EditCompanyFormProps) => {
  const t = useTranslations('Admin.companies');
  const updateMutation = useUpdateAdminCompanyMutation(company.id);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateCompanyFormValues>({
    resolver: zodResolver(updateCompanySchema),
    defaultValues: {
      name: company.name,
      description: company.description ?? '',
      status: company.status,
      logoMediaId: company.logoMediaId ?? '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setSuccess(false);
    try {
      await updateMutation.mutateAsync({
        name: values.name,
        description: values.description.length > 0 ? values.description : null,
        status: values.status,
        logoMediaId: toNullableMediaId(values.logoMediaId),
      });
      setSuccess(true);
    } catch {
      setFormError(t('errors.generic'));
    }
  });

  const busy = isSubmitting || updateMutation.isPending;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <FormField
          id="edit-company-name"
          label={t('form.name')}
          error={errors.name ? t('validation.name') : undefined}
        >
          <Input id="edit-company-name" aria-invalid={Boolean(errors.name)} {...register('name')} />
        </FormField>

        <FormField
          id="edit-company-status"
          label={t('form.status')}
          error={errors.status ? t('validation.status') : undefined}
        >
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                id="edit-company-status"
                name={field.name}
                value={field.value}
                size="fit"
                aria-label={t('form.status')}
                aria-invalid={Boolean(errors.status)}
                onBlur={field.onBlur}
                onChange={(event) => {
                  field.onChange(event.target.value);
                }}
              >
                {COMPANY_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {t(`statuses.${status}`)}
                  </option>
                ))}
              </Select>
            )}
          />
        </FormField>
      </div>

      <FormField
        id="edit-company-description"
        label={t('form.description')}
        error={errors.description ? t('validation.description') : undefined}
      >
        <textarea
          id="edit-company-description"
          rows={3}
          className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm text-ink focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
          {...register('description')}
        />
      </FormField>

      <Controller
        control={control}
        name="logoMediaId"
        render={({ field, fieldState }) => (
          <MediaUploadField
            id="edit-company-logo"
            label={t('form.logoMedia')}
            context="admin"
            value={field.value}
            onChange={field.onChange}
            previewUrl={company.logoUrl}
            error={fieldState.error?.message}
          />
        )}
      />

      {formError ? (
        <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2 text-sm text-danger">
          {formError}
        </p>
      ) : null}

      {success ? (
        <p role="status" className="rounded-sm bg-surface px-3 py-2 text-sm text-success">
          {t('detail.saveSuccess')}
        </p>
      ) : null}

      <Button type="submit" variant="primary" disabled={busy || !isDirty}>
        {busy ? t('detail.saving') : t('detail.save')}
      </Button>
    </form>
  );
};
