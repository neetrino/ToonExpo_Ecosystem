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
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';

/**
 * Authenticated change-password form with success toast and reset.
 */
export const ChangePasswordForm = () => {
  const t = useTranslations('Profile.changePassword');
  const tAuth = useTranslations('Auth');
  const changePasswordMutation = useChangePasswordMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    setSuccess(false);
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      reset();
      setSuccess(true);
    } catch (error) {
      setFormError(t(`errors.${mapChangePasswordError(error)}`));
    }
  });

  const busy = isSubmitting || changePasswordMutation.isPending;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <FormField
        id="change-password-current"
        label={t('fields.currentPassword')}
        error={errors.currentPassword ? t('validation.currentPassword') : undefined}
      >
        <Input
          id="change-password-current"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.currentPassword)}
          {...register('currentPassword')}
        />
      </FormField>

      <FormField
        id="change-password-new"
        label={t('fields.newPassword')}
        error={errors.newPassword ? tAuth('validation.password') : undefined}
      >
        <Input
          id="change-password-new"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.newPassword)}
          {...register('newPassword')}
        />
      </FormField>

      <FormField
        id="change-password-confirm"
        label={t('fields.confirmPassword')}
        error={errors.confirmPassword ? tAuth('validation.confirmPassword') : undefined}
      >
        <Input
          id="change-password-confirm"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register('confirmPassword')}
        />
      </FormField>

      {formError ? (
        <p role="alert" className="text-sm text-danger">
          {formError}
        </p>
      ) : null}

      {success ? (
        <p role="status" className="text-sm text-success">
          {t('success')}
        </p>
      ) : null}

      <Button type="submit" variant="secondary" disabled={busy} className="w-full">
        {busy ? t('submitting') : t('submit')}
      </Button>
    </form>
  );
};
