'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  AUTH_CONTROL_CLASS,
  AUTH_LABEL_CLASS,
  AUTH_SUBMIT_CLASS,
} from '@/features/auth/constants/auth-form-styles';
import { useLoginMutation } from '@/features/auth/hooks/use-auth';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/login.schema';
import { mapAuthError } from '@/features/auth/utils/map-auth-error';
import { resolvePostLoginPath } from '@/features/auth/utils/resolve-post-login-path';
import { sanitizeReturnUrl } from '@/features/auth/utils/sanitize-return-url';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { PasswordInput } from '@/shared/ui/password-input';

type LoginFormProps = {
  returnUrl?: string | undefined;
};

/**
 * Email/password login form with NestJS-backed session cookie.
 */
export const LoginForm = ({ returnUrl }: LoginFormProps) => {
  const t = useTranslations('Auth');
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const safeReturn = returnUrl ? sanitizeReturnUrl(returnUrl) : null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const session = await loginMutation.mutateAsync(values);
      router.push(resolvePostLoginPath(session.user, safeReturn));
    } catch (error) {
      setFormError(t(`errors.${mapAuthError(error)}`));
    }
  });

  const busy = isSubmitting || loginMutation.isPending;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      <FormField
        id="login-email"
        label={t('fields.email')}
        labelClassName={AUTH_LABEL_CLASS}
        error={errors.email ? t('validation.email') : undefined}
      >
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder={t('login.placeholders.email')}
          aria-invalid={Boolean(errors.email)}
          className={AUTH_CONTROL_CLASS}
          {...register('email')}
        />
      </FormField>

      <FormField
        id="login-password"
        label={t('fields.password')}
        labelClassName={AUTH_LABEL_CLASS}
        error={errors.password ? t('validation.password') : undefined}
      >
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          placeholder={t('login.placeholders.password')}
          aria-invalid={Boolean(errors.password)}
          className={AUTH_CONTROL_CLASS}
          revealLabel={t('fields.showPassword')}
          hideLabel={t('fields.hidePassword')}
          {...register('password')}
        />
      </FormField>

      <p className="-mt-2 text-right text-sm">
        <Link
          href="/auth/forgot-password"
          className="font-medium tracking-tight text-brand transition-colors hover:text-brand-hover"
        >
          {t('login.forgotPassword')}
        </Link>
      </p>

      {formError ? (
        <p role="alert" className="rounded-md bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
          {formError}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="secondary"
        size="lg"
        disabled={busy}
        className={AUTH_SUBMIT_CLASS}
      >
        {busy ? t('login.submitting') : t('login.submit')}
      </Button>

      <div className="relative pt-1">
        <div
          className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-border to-transparent"
          aria-hidden
        />
        <p className="relative mx-auto w-fit bg-surface-elevated px-4 text-center text-sm text-ink-secondary">
          {t('login.noAccount')}{' '}
          <Link
            href="/auth/register"
            className="font-semibold text-brand transition-colors hover:text-brand-hover"
          >
            {t('login.registerLink')}
          </Link>
        </p>
      </div>
    </form>
  );
};
