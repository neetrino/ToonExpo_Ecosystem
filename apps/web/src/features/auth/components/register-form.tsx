'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useRegisterMutation } from '@/features/auth/hooks/use-auth';
import {
  registerSchema,
  toRegisterRequest,
  type RegisterFormValues,
} from '@/features/auth/schemas/register.schema';
import { mapAuthError } from '@/features/auth/utils/map-auth-error';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { PasswordInput } from '@/shared/ui/password-input';

/**
 * Buyer self-registration form with NestJS-backed session cookie.
 */
export const RegisterForm = () => {
  const t = useTranslations('Auth');
  const router = useRouter();
  const registerMutation = useRegisterMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      surname: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await registerMutation.mutateAsync(toRegisterRequest(values));
      router.push('/settings');
    } catch (error) {
      setFormError(t(`errors.${mapAuthError(error)}`));
    }
  });

  const busy = isSubmitting || registerMutation.isPending;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="register-first-name"
          label={t('fields.firstName')}
          error={errors.firstName ? t('validation.firstName') : undefined}
        >
          <Input
            id="register-first-name"
            autoComplete="given-name"
            aria-invalid={Boolean(errors.firstName)}
            className="bg-surface-input"
            {...register('firstName')}
          />
        </FormField>

        <FormField
          id="register-surname"
          label={t('fields.surname')}
          error={errors.surname ? t('validation.surname') : undefined}
        >
          <Input
            id="register-surname"
            autoComplete="family-name"
            aria-invalid={Boolean(errors.surname)}
            className="bg-surface-input"
            {...register('surname')}
          />
        </FormField>
      </div>

      <FormField
        id="register-phone"
        label={t('fields.phone')}
        error={errors.phone ? t('validation.phone') : undefined}
      >
        <Input
          id="register-phone"
          type="tel"
          autoComplete="tel"
          placeholder="+374 …"
          aria-invalid={Boolean(errors.phone)}
          className="bg-surface-input"
          {...register('phone')}
        />
      </FormField>

      <FormField
        id="register-email"
        label={t('fields.email')}
        error={errors.email ? t('validation.email') : undefined}
      >
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          aria-invalid={Boolean(errors.email)}
          className="bg-surface-input"
          {...register('email')}
        />
      </FormField>

      <FormField
        id="register-password"
        label={t('fields.password')}
        error={errors.password ? t('validation.password') : undefined}
      >
        <PasswordInput
          id="register-password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          className="bg-surface-input"
          revealLabel={t('fields.showPassword')}
          hideLabel={t('fields.hidePassword')}
          {...register('password')}
        />
      </FormField>

      <FormField
        id="register-confirm-password"
        label={t('fields.confirmPassword')}
        error={errors.confirmPassword ? t('validation.confirmPassword') : undefined}
      >
        <PasswordInput
          id="register-confirm-password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          className="bg-surface-input"
          revealLabel={t('fields.showPassword')}
          hideLabel={t('fields.hidePassword')}
          {...register('confirmPassword')}
        />
      </FormField>

      {formError ? (
        <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2.5 text-sm text-danger">
          {formError}
        </p>
      ) : null}

      <Button type="submit" variant="secondary" size="lg" disabled={busy} className="mt-1 w-full">
        {busy ? t('register.submitting') : t('register.submit')}
      </Button>

      <div className="relative py-1">
        <div className="absolute inset-x-0 top-1/2 h-px bg-border" aria-hidden />
        <p className="relative mx-auto w-fit bg-surface-elevated px-3 text-center text-sm text-ink-secondary">
          {t('register.hasAccount')}{' '}
          <Link
            href="/auth/login"
            className="font-semibold text-brand transition-colors hover:text-brand-hover"
          >
            {t('register.loginLink')}
          </Link>
        </p>
      </div>
    </form>
  );
};
