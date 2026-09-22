'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { CompanyResponse } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, useForm, type Control } from 'react-hook-form';

import { CompanyCopyFields } from '@/features/admin/components/company-copy-fields';
import { COMPANY_STATUSES } from '@/features/admin/constants';
import { useUpdateAdminCompanyMutation } from '@/features/admin/hooks/use-admin-companies';
import {
  updateCompanySchema,
  type UpdateCompanyFormValues,
} from '@/features/admin/schemas/update-company.schema';
import {
  companyCopyDefaultsFrom,
  toCompanyCopyPatch,
} from '@/features/admin/utils/company-copy-mappers';
import type { TranslationLocale } from '@/features/builder/components/translation-tabs';
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
import { useFormErrorToast } from '@/shared/ui/use-form-error-toast';
import { useSuccessToast } from '@/shared/ui/use-success-toast';
import { Select } from '@/shared/ui/select';

type EditCompanyFormProps = {
  company: CompanyResponse;
};

const blurActiveField = (): void => {
  const active = document.activeElement;
  if (active instanceof HTMLElement) {
    active.blur();
  }
};

/**
 * Inline PATCH form for company profile fields and status.
 */
export const EditCompanyForm = ({ company }: EditCompanyFormProps) => {
  const t = useTranslations('Admin.companies');
  const updateMutation = useUpdateAdminCompanyMutation(company.id);
  const { showSuccess, successToast } = useSuccessToast();
  const [focusLocale, setFocusLocale] = useState<TranslationLocale | undefined>();
  const [focusTick, setFocusTick] = useState(0);
  const { showError, onInvalid, errorToast } = useFormErrorToast({
    fieldLabels: {
      name: t('form.name'),
      status: t('form.status'),
      shortDescription: t('form.shortDescription'),
      description: t('form.description'),
    },
    onTranslationError: (locale) => {
      setFocusLocale(locale);
      setFocusTick((tick) => tick + 1);
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateCompanyFormValues>({
    resolver: zodResolver(updateCompanySchema),
    defaultValues: {
      ...companyCopyDefaultsFrom(company),
      status: company.status,
      logoMediaId: company.logoMediaId ?? '',
      coverMediaId: company.coverMediaId ?? '',
      ...companyContactDefaultsFrom(company),
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    blurActiveField();
    try {
      await updateMutation.mutateAsync({
        ...toCompanyCopyPatch(values),
        status: values.status,
        logoMediaId: toNullableMediaId(values.logoMediaId),
        coverMediaId: toNullableMediaId(values.coverMediaId),
        ...companyContactPatchFrom(values),
      });
      reset(values);
      showSuccess(t('detail.saveSuccess'));
    } catch {
      showError(t('errors.generic'));
    }
  }, onInvalid);

  const busy = isSubmitting || updateMutation.isPending;

  const statusField = (
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
  );

  return (
    <>
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <CompanyCopyFields
          register={register}
          errors={errors}
          idPrefix="edit-company"
          focusLocale={focusLocale}
          focusTick={focusTick}
          nameAside={statusField}
        />

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

        <Button type="submit" variant="primary" disabled={busy || !isDirty}>
          {busy ? t('detail.saving') : t('detail.save')}
        </Button>
      </form>
      {successToast}
      {errorToast}
    </>
  );
};
