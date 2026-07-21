'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

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
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <FormField
        id="login-email"
        label={t('fields.email')}
        error={errors.email ? t('validation.email') : undefined}
      >
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          aria-invalid={Boolean(errors.email)}
          className="bg-surface-input"
          {...register('email')}
        />
      </FormField>

      <FormField
        id="login-password"
        label={t('fields.password')}
        error={errors.password ? t('validation.password') : undefined}
      >
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          className="bg-surface-input"
          revealLabel={t('fields.showPassword')}
          hideLabel={t('fields.hidePassword')}
          {...register('password')}
        />
      </FormField>

      <p className="-mt-1 text-right text-sm">
        <Link
          href="/auth/forgot-password"
          className="font-medium text-brand transition-colors hover:text-brand-hover"
        >
          {t('login.forgotPassword')}
        </Link>
      </p>

      {formError ? (
        <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2.5 text-sm text-danger">
          {formError}
        </p>
      ) : null}

      <Button type="submit" variant="secondary" size="lg" disabled={busy} className="mt-1 w-full">
        {busy ? t('login.submitting') : t('login.submit')}
      </Button>

      <div className="relative py-1">
        <div className="absolute inset-x-0 top-1/2 h-px bg-border" aria-hidden />
        <p className="relative mx-auto w-fit bg-surface-elevated px-3 text-center text-sm text-ink-secondary">
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
