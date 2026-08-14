'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { CreateCompanyRequest } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useCreateAdminCompanyMutation } from '@/features/admin/hooks/use-admin-companies';
import {
  createCompanySchema,
  type CreateCompanyFormValues,
} from '@/features/admin/schemas/create-company.schema';
import { COMPANY_DESCRIPTION_MAX_LENGTH, COMPANY_SHORT_DESCRIPTION_MAX_LENGTH } from '@/features/admin/constants';
import { toOptionalPhone } from '@/shared/lib/phone';
import { ApiError } from '@/shared/api/errors';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { PhoneFormControl } from '@/shared/ui/phone-form-control';
import { Textarea } from '@/shared/ui/textarea';

type CreateCompanyFormProps = {
  onSuccess: (adminEmail: string) => void;
};

const BUILDER_COMPANY_TYPE = 'builder' as const;

const mapCreateError = (error: unknown): 'emailTaken' | 'generic' => {
  if (error instanceof ApiError && error.status === 409) {
    return 'emailTaken';
  }
  return 'generic';
};

/**
 * Form to provision a builder company and invite the first company_admin.
 * Backend creates the company-level readiness assessment in the same flow.
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
      type: BUILDER_COMPANY_TYPE,
      description: '',
      shortDescription: '',
      adminName: '',
      adminEmail: '',
      adminPhone: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const adminPhone = toOptionalPhone(values.adminPhone);
    const body: CreateCompanyRequest = {
      name: values.name,
      type: BUILDER_COMPANY_TYPE,
      adminName: values.adminName,
      adminEmail: values.adminEmail,
      locale,
      ...(values.description.length > 0 ? { description: values.description } : {}),
      ...(values.shortDescription.length > 0 ? { shortDescription: values.shortDescription } : {}),
      ...(adminPhone ? { adminPhone } : {}),
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
          id="company-short-description"
          label={t('form.shortDescription')}
          error={errors.shortDescription ? t('validation.shortDescription') : undefined}
        >
          <Textarea
            id="company-short-description"
            rows={2}
            maxLength={COMPANY_SHORT_DESCRIPTION_MAX_LENGTH}
            className="min-h-20"
            aria-invalid={Boolean(errors.shortDescription)}
            aria-describedby="company-short-description-hint"
            {...register('shortDescription')}
          />
          <p id="company-short-description-hint" className="text-xs text-ink-muted">
            {t('form.shortDescriptionHint')}
          </p>
        </FormField>
        <FormField
          id="company-description"
          label={t('form.description')}
          error={errors.description ? t('validation.description') : undefined}
        >
          <Textarea
            id="company-description"
            rows={3}
            maxLength={COMPANY_DESCRIPTION_MAX_LENGTH}
            className="min-h-24"
            aria-invalid={Boolean(errors.description)}
            aria-describedby="company-description-hint"
            {...register('description')}
          />
          <p id="company-description-hint" className="text-xs text-ink-muted">
            {t('form.descriptionHint')}
          </p>
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
          <PhoneFormControl
            control={control}
            name="adminPhone"
            id="admin-phone"
            autoComplete="tel"
            aria-invalid={Boolean(errors.adminPhone)}
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
