'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { CompanyProfileResponse } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { COMPANY_DESCRIPTION_MAX_LENGTH } from '@/features/admin/constants';
import { useUpdateCompanyProfileMutation } from '@/features/builder/hooks/use-company-profile';
import { CompanyContactFields } from '@/features/companies/components/company-contact-fields';
import {
  companyContactDefaultsFrom,
  companyContactFieldsSchema,
  companyContactPatchFrom,
  emptyToNull,
} from '@/features/companies/schemas/company-contact-fields.schema';
import { MediaUploadField } from '@/features/media/components/media-upload-field';
import {
  optionalMediaIdField,
  toNullableMediaId,
} from '@/features/media/schemas/media-fields.schema';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { useFormErrorToast } from '@/shared/ui/use-form-error-toast';
import { useSuccessToast } from '@/shared/ui/use-success-toast';

const companyProfileSchema = z
  .object({
    description: z.string().trim().max(COMPANY_DESCRIPTION_MAX_LENGTH),
    logoMediaId: optionalMediaIdField,
  })
  .merge(companyContactFieldsSchema);

type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;

type CompanyProfileFormProps = {
  profile: CompanyProfileResponse;
  canEdit: boolean;
};

/**
 * Builder portal company profile editor for company admins.
 */
export const CompanyProfileForm = ({ profile, canEdit }: CompanyProfileFormProps) => {
  const t = useTranslations('Builder.company');
  const mutation = useUpdateCompanyProfileMutation();
  const { showSuccess, successToast } = useSuccessToast();
  const { showError, onInvalid, errorToast } = useFormErrorToast({
    fieldLabels: { description: t('form.description'), logoMediaId: t('form.logoMedia') },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      description: profile.description ?? '',
      logoMediaId: profile.logoMediaId ?? '',
      ...companyContactDefaultsFrom(profile),
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({
        description: emptyToNull(values.description),
        logoMediaId: toNullableMediaId(values.logoMediaId),
        ...companyContactPatchFrom(values),
      });
      showSuccess(t('saveSuccess'));
    } catch {
      showError(t('errors.generic'));
    }
  }, onInvalid);

  if (!canEdit) {
    return <p className="text-sm text-ink-secondary">{t('adminOnly')}</p>;
  }

  const busy = isSubmitting || mutation.isPending;

  return (
    <>
    <form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-4" noValidate>
      <FormField
        id="company-description"
        label={t('form.description')}
        error={errors.description ? t('validation.description') : undefined}
      >
        <textarea
          id="company-description"
          rows={4}
          className="w-full rounded-sm border border-border bg-background px-4 py-3 text-base text-ink lg:text-sm focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
          {...register('description')}
        />
      </FormField>

      <CompanyContactFields
        control={control}
        register={register}
        errors={errors}
        idPrefix="company"
        labelsNamespace="Builder.company"
      />

      <Controller
        control={control}
        name="logoMediaId"
        render={({ field, fieldState }) => (
          <MediaUploadField
            id="company-logo"
            label={t('form.logoMedia')}
            context="portal"
            value={field.value}
            onChange={field.onChange}
            previewUrl={profile.logoUrl}
            error={fieldState.error?.message}
          />
        )}
      />
      <Button type="submit" variant="secondary" disabled={busy || !isDirty}>
        {busy ? t('saving') : t('save')}
      </Button>
    </form>
    {successToast}
    {errorToast}
    </>
  );
};
