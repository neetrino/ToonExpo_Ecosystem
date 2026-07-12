'use client';

import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { Link } from '@/i18n/navigation';
import { type AuthActionState, INITIAL_AUTH_ACTION_STATE } from '@/lib/auth/action-state';

type RegisterFormProps = {
  action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState>;
  loginHref?: string;
};

const FIELD_CLASS =
  'w-full rounded border border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--te-accent)]';

export function RegisterForm({ action, loginHref = '/login' }: RegisterFormProps) {
  const t = useTranslations('auth');
  const [state, formAction, pending] = useActionState(action, INITIAL_AUTH_ACTION_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('fields.name')}</span>
        <input className={FIELD_CLASS} type="text" name="name" autoComplete="name" required />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('fields.phone')}</span>
        <input className={FIELD_CLASS} type="tel" name="phone" autoComplete="tel" required />
      </label>
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
          autoComplete="new-password"
          minLength={8}
          required
        />
      </label>

      {state.errorKey ? (
        <p role="alert" className="text-sm text-red-400">
          {t(`errors.${state.errorKey}`)}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-[var(--te-accent)] px-4 py-2 text-sm font-medium disabled:opacity-60"
      >
        {t('register.submit')}
      </button>

      <p className="text-sm text-[var(--te-muted)]">
        {t('register.loginPrompt')}{' '}
        <Link className="underline" href={loginHref}>
          {t('register.loginLink')}
        </Link>
      </p>
    </form>
  );
}
