'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { CreateCompanyRequest } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { CompanyCopyFields } from '@/features/admin/components/company-copy-fields';
import { useCreateAdminCompanyMutation } from '@/features/admin/hooks/use-admin-companies';
import { emptyCompanyCopyValues } from '@/features/admin/schemas/company-copy-fields.schema';
import {
  createCompanySchema,
  type CreateCompanyFormValues,
} from '@/features/admin/schemas/create-company.schema';
import { toCompanyCopyRequest } from '@/features/admin/utils/company-copy-mappers';
import type { TranslationLocale } from '@/features/builder/components/translation-tabs';
import { ApiError } from '@/shared/api/errors';
import { toOptionalPhone } from '@/shared/lib/phone';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { PhoneFormControl } from '@/shared/ui/phone-form-control';
import { useFormErrorToast } from '@/shared/ui/use-form-error-toast';

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
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const createMutation = useCreateAdminCompanyMutation();
  const [focusLocale, setFocusLocale] = useState<TranslationLocale | undefined>();
  const [focusTick, setFocusTick] = useState(0);
  const { showError, onInvalid, errorToast } = useFormErrorToast({
    fieldLabels: {
      name: t('form.name'),
      adminName: t('form.adminName'),
      adminEmail: t('form.adminEmail'),
      adminPhone: t('form.adminPhone'),
    },
    onTranslationError: (nextLocale) => {
      setFocusLocale(nextLocale);
      setFocusTick((tick) => tick + 1);
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCompanyFormValues>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      ...emptyCompanyCopyValues(),
      type: BUILDER_COMPANY_TYPE,
      adminName: '',
      adminEmail: '',
      adminPhone: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const adminPhone = toOptionalPhone(values.adminPhone);
    const body: CreateCompanyRequest = {
      ...toCompanyCopyRequest(values),
      type: BUILDER_COMPANY_TYPE,
      adminName: values.adminName,
      adminEmail: values.adminEmail,
      locale,
      ...(adminPhone ? { adminPhone } : {}),
    };

    try {
      await createMutation.mutateAsync(body);
      onSuccess(values.adminEmail);
    } catch (error) {
      showError(t(`errors.${mapCreateError(error)}`));
    }
  }, onInvalid);

  const busy = isSubmitting || createMutation.isPending;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2.5 text-xs font-semibold tracking-wide text-ink-muted uppercase">
          {t('form.companySection')}
        </legend>
        <CompanyCopyFields
          register={register}
          errors={errors}
          idPrefix="company"
          focusLocale={focusLocale}
          focusTick={focusTick}
        />
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
            placeholder={tCommon('placeholders.personName')}
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
            placeholder={tCommon('placeholders.personEmail')}
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

      <Button type="submit" variant="primary" disabled={busy}>
        {busy ? t('form.submitting') : t('form.submit')}
      </Button>
      {errorToast}
    </form>
  );
};
