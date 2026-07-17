'use client';

import { buyerRegisterSchema, loginSchema } from '@toonexpo/contracts';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useTransition, type FormEvent } from 'react';

import { Link } from '@/i18n/navigation';
import { ApiClientError } from '@/lib/api';
import type { AuthErrorKey } from '@/lib/auth/action-state';
import { loginWithApi } from '@/lib/auth/api-auth';
import { defaultAuthRedirect, safeAuthCallbackPath } from '@/lib/auth/callback-url';
import { TeButton } from '@/components/ui/te-button';

type LoginFormProps = {
  locale: string;
  callbackUrl: string | null;
  registerHref?: string;
};

const FIELD_CLASS =
  'w-full rounded-md border border-[var(--te-border)] bg-[var(--te-card)] px-3 py-2 text-sm text-[var(--te-fg)] outline-none focus:border-[var(--te-accent)]';

function toAuthErrorKey(error: unknown): AuthErrorKey {
  if (!(error instanceof ApiClientError)) {
    return 'invalidCredentials';
  }
  if (error.code === 'RATE_LIMITED') {
    return 'rateLimited';
  }
  if (error.code === 'VALIDATION_ERROR') {
    return 'invalidInput';
  }
  return 'invalidCredentials';
}

export function LoginForm({ locale, callbackUrl, registerHref = '/register' }: LoginFormProps) {
  const t = useTranslations('auth');
  const router = useRouter();
  const [errorKey, setErrorKey] = useState<AuthErrorKey | undefined>();
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    });
    if (!parsed.success) {
      setErrorKey('invalidInput');
      return;
    }

    startTransition(async () => {
      try {
        await loginWithApi(parsed.data);
        const redirectTo =
          safeAuthCallbackPath(callbackUrl, locale) ?? defaultAuthRedirect(locale);
        router.push(redirectTo);
        router.refresh();
      } catch (error) {
        setErrorKey(toAuthErrorKey(error));
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('fields.email')}</span>
        <input className={FIELD_CLASS} type="email" name="email" autoComplete="email" required />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('fields.password')}</span>
        <input
          className={FIELD_CLASS}
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
      </label>

      {errorKey ? (
        <p role="alert" className="text-sm text-[#b91c1c]">
          {t(`errors.${errorKey}`)}
        </p>
      ) : null}

      <TeButton type="submit" disabled={pending}>
        {t('login.submit')}
      </TeButton>

      <p className="text-sm text-[var(--te-muted)]">
        {t('login.registerPrompt')}{' '}
        <Link className="font-medium text-[var(--te-accent)] underline" href={registerHref}>
          {t('login.registerLink')}
        </Link>
      </p>
    </form>
  );
}
