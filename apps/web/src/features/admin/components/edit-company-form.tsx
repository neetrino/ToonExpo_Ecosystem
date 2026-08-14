'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { CompanyResponse } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, useForm, type Control } from 'react-hook-form';

import { COMPANY_DESCRIPTION_MAX_LENGTH, COMPANY_SHORT_DESCRIPTION_MAX_LENGTH, COMPANY_STATUSES } from '@/features/admin/constants';
import { useUpdateAdminCompanyMutation } from '@/features/admin/hooks/use-admin-companies';
import {
  updateCompanySchema,
  type UpdateCompanyFormValues,
} from '@/features/admin/schemas/update-company.schema';
import { CompanyContactFields } from '@/features/companies/components/company-contact-fields';
import {
  CompanyMediaFields,
  type CompanyMediaFieldValues,
} from '@/features/companies/components/company-media-fields';
import {
  companyContactDefaultsFrom,
  companyContactPatchFrom,
} from '@/features/companies/schemas/company-contact-fields.schema';
import { toNullableMediaId } from '@/features/media/schemas/media-fields.schema';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { useSuccessToast } from '@/shared/ui/use-success-toast';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';

type EditCompanyFormProps = {
  company: CompanyResponse;
};

/**
 * Inline PATCH form for company profile fields and status.
 */
export const EditCompanyForm = ({ company }: EditCompanyFormProps) => {
  const t = useTranslations('Admin.companies');
  const updateMutation = useUpdateAdminCompanyMutation(company.id);
  const [formError, setFormError] = useState<string | null>(null);
  const { showSuccess, successToast } = useSuccessToast();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateCompanyFormValues>({
    resolver: zodResolver(updateCompanySchema),
    defaultValues: {
      name: company.name,
      description: company.description ?? '',
      shortDescription: company.shortDescription ?? '',
      status: company.status,
      logoMediaId: company.logoMediaId ?? '',
      coverMediaId: company.coverMediaId ?? '',
      ...companyContactDefaultsFrom(company),
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await updateMutation.mutateAsync({
        name: values.name,
        description: values.description.length > 0 ? values.description : null,
        shortDescription: values.shortDescription.length > 0 ? values.shortDescription : null,
        status: values.status,
        logoMediaId: toNullableMediaId(values.logoMediaId),
        coverMediaId: toNullableMediaId(values.coverMediaId),
        ...companyContactPatchFrom(values),
      });
      reset(values);
      showSuccess(t('detail.saveSuccess'));
    } catch {
      setFormError(t('errors.generic'));
    }
  });

  const busy = isSubmitting || updateMutation.isPending;

  return (
    <>
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
        id="edit-company-short-description"
        label={t('form.shortDescription')}
        error={errors.shortDescription ? t('validation.shortDescription') : undefined}
      >
        <Textarea
          id="edit-company-short-description"
          rows={2}
          maxLength={COMPANY_SHORT_DESCRIPTION_MAX_LENGTH}
          className="min-h-20"
          aria-invalid={Boolean(errors.shortDescription)}
          aria-describedby="edit-company-short-description-hint"
          {...register('shortDescription')}
        />
        <p id="edit-company-short-description-hint" className="text-xs text-ink-muted">
          {t('form.shortDescriptionHint')}
        </p>
      </FormField>

      <FormField
        id="edit-company-description"
        label={t('form.description')}
        error={errors.description ? t('validation.description') : undefined}
      >
        <Textarea
          id="edit-company-description"
          rows={5}
          maxLength={COMPANY_DESCRIPTION_MAX_LENGTH}
          className="min-h-32"
          aria-invalid={Boolean(errors.description)}
          aria-describedby="edit-company-description-hint"
          {...register('description')}
        />
        <p id="edit-company-description-hint" className="text-xs text-ink-muted">
          {t('form.descriptionHint')}
        </p>
      </FormField>

      <CompanyContactFields
        control={control}
        register={register}
        errors={errors}
        idPrefix="edit-company"
        labelsNamespace="Admin.companies"
      />

      <CompanyMediaFields
        control={control as unknown as Control<CompanyMediaFieldValues>}
        context="admin"
        logoPreviewUrl={company.logoUrl}
        coverPreviewUrl={company.coverUrl}
      />

      {formError ? (
        <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2 text-sm text-danger">
          {formError}
        </p>
      ) : null}

      <Button type="submit" variant="primary" disabled={busy || !isDirty}>
        {busy ? t('detail.saving') : t('detail.save')}
      </Button>
    </form>
    {successToast}
    </>
  );
};
