'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useForgotPasswordMutation } from '@/features/auth/hooks/use-auth';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/features/auth/schemas/forgot-password.schema';
import { mapAuthError } from '@/features/auth/utils/map-auth-error';
import { BackLink } from '@/shared/ui/back-link';
import { Button } from '@/shared/ui/button';
import { Form } from '@/shared/ui/form';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';

/**
 * Email form that requests a password-reset link (opaque success message).
 */
export const ForgotPasswordForm = () => {
  const t = useTranslations('Auth');
  const forgotMutation = useForgotPasswordMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await forgotMutation.mutateAsync(values);
      setSubmitted(true);
    } catch (error) {
      setFormError(t(`errors.${mapAuthError(error)}`));
    }
  });

  const busy = isSubmitting || forgotMutation.isPending;

  if (submitted) {
    return (
      <div className="flex flex-col gap-5">
        <p role="status" className="text-sm text-ink">
          {t('forgotPassword.success')}
        </p>
        <div className="flex justify-center">
          <BackLink href="/auth/login" label={t('forgotPassword.backToLogin')} variant="compact" />
        </div>
      </div>
    );
  }

  return (
    <Form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <FormField
        id="forgot-email"
        label={t('fields.email')}
        error={errors.email ? t('validation.email') : undefined}
      >
        <Input
          id="forgot-email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          {...register('email')}
        />
      </FormField>

      {formError ? (
        <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2 text-sm text-danger">
          {formError}
        </p>
      ) : null}

      <Button type="submit" variant="secondary" disabled={busy} className="w-full">
        {busy ? t('forgotPassword.submitting') : t('forgotPassword.submit')}
      </Button>

      <div className="flex justify-center">
        <BackLink href="/auth/login" label={t('forgotPassword.backToLogin')} variant="compact" />
      </div>
    </Form>
  );
};
