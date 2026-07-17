'use client';

import { setPasswordSchema } from '@toonexpo/contracts';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useTransition, type FormEvent } from 'react';

import { ApiClientError } from '@/lib/api';
import { setPasswordWithApi } from '@/lib/auth/api-auth';
import { LOGIN_PATH } from '@/lib/auth/constants';
import type { InviteErrorKey } from '@/lib/auth/invite-action-state';
import { TeButton } from '@/components/ui/te-button';

type SetPasswordFormProps = {
  locale: string;
  token: string;
};

const FIELD_CLASS =
  'w-full rounded-md border border-[var(--te-border)] bg-[var(--te-card)] px-3 py-2 text-sm text-[var(--te-fg)] outline-none focus:border-[var(--te-accent)]';

function toInviteErrorKey(error: unknown): InviteErrorKey {
  if (!(error instanceof ApiClientError)) {
    return 'invalidOrExpired';
  }
  if (error.code === 'RATE_LIMITED') {
    return 'rateLimited';
  }
  if (error.code === 'VALIDATION_ERROR') {
    return 'invalidInput';
  }
  return 'invalidOrExpired';
}

export function SetPasswordForm({ locale, token }: SetPasswordFormProps) {
  const t = useTranslations('auth.invite');
  const router = useRouter();
  const [errorKey, setErrorKey] = useState<InviteErrorKey | undefined>();
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsed = setPasswordSchema.safeParse({
      token,
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    });
    if (!parsed.success) {
      setErrorKey('invalidInput');
      return;
    }

    startTransition(async () => {
      try {
        await setPasswordWithApi(parsed.data);
        router.push(`/${locale}${LOGIN_PATH}?invited=1`);
        router.refresh();
      } catch (error) {
        setErrorKey(toInviteErrorKey(error));
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('fields.password')}</span>
        <input
          className={FIELD_CLASS}
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('fields.confirmPassword')}</span>
        <input
          className={FIELD_CLASS}
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>

      {errorKey ? (
        <p role="alert" className="text-sm text-[#b91c1c]">
          {t(`errors.${errorKey}`)}
        </p>
      ) : null}

      <TeButton type="submit" disabled={pending}>
        {t('submit')}
      </TeButton>
    </form>
  );
}
