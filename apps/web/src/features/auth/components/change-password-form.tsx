'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useChangePasswordMutation } from '@/features/auth/hooks/use-auth';
import {
  changePasswordFormSchema,
  type ChangePasswordFormValues,
} from '@/features/auth/schemas/change-password.schema';
import { mapChangePasswordError } from '@/features/auth/utils/map-auth-error';
import { Button } from '@/shared/ui/button';
import { Form } from '@/shared/ui/form';
import { FormField } from '@/shared/ui/form-field';
import { PasswordInput } from '@/shared/ui/password-input';
import { useSuccessToast } from '@/shared/ui/use-success-toast';

/**
 * Authenticated change-password form with success toast and reset.
 */
export const ChangePasswordForm = () => {
  const t = useTranslations('Profile.changePassword');
  const tAuth = useTranslations('Auth');
  const changePasswordMutation = useChangePasswordMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const { showSuccess, successToast } = useSuccessToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      reset();
      showSuccess(t('success'));
    } catch (error) {
      setFormError(t(`errors.${mapChangePasswordError(error)}`));
    }
  });

  const busy = isSubmitting || changePasswordMutation.isPending;

  return (
    <>
    <Form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <FormField
        id="change-password-current"
        label={t('fields.currentPassword')}
        error={errors.currentPassword ? t('validation.currentPassword') : undefined}
      >
        <PasswordInput
          id="change-password-current"
          autoComplete="current-password"
          placeholder="********"
          aria-invalid={Boolean(errors.currentPassword)}
          revealLabel={tAuth('fields.showPassword')}
          hideLabel={tAuth('fields.hidePassword')}
          {...register('currentPassword')}
        />
      </FormField>

      <FormField
        id="change-password-new"
        label={t('fields.newPassword')}
        error={errors.newPassword ? tAuth('validation.password') : undefined}
      >
        <PasswordInput
          id="change-password-new"
          autoComplete="new-password"
          placeholder="********"
          aria-invalid={Boolean(errors.newPassword)}
          revealLabel={tAuth('fields.showPassword')}
          hideLabel={tAuth('fields.hidePassword')}
          {...register('newPassword')}
        />
      </FormField>

      <FormField
        id="change-password-confirm"
        label={t('fields.confirmPassword')}
        error={errors.confirmPassword ? tAuth('validation.confirmPassword') : undefined}
      >
        <PasswordInput
          id="change-password-confirm"
          autoComplete="new-password"
          placeholder="********"
          aria-invalid={Boolean(errors.confirmPassword)}
          revealLabel={tAuth('fields.showPassword')}
          hideLabel={tAuth('fields.hidePassword')}
          {...register('confirmPassword')}
        />
      </FormField>

      {formError ? (
        <p role="alert" className="text-sm text-danger">
          {formError}
        </p>
      ) : null}

      <Button type="submit" variant="primary" disabled={busy} className="w-full sm:w-auto">
        {busy ? t('submitting') : t('submit')}
      </Button>
    </Form>
    {successToast}
    </>
  );
};
