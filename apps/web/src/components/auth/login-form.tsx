'use client';

import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { Link } from '@/i18n/navigation';
import { type AuthActionState, INITIAL_AUTH_ACTION_STATE } from '@/lib/auth/action-state';

type LoginFormProps = {
  action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState>;
  registerHref?: string;
};

const FIELD_CLASS =
  'w-full rounded-md border border-[var(--te-border)] bg-[var(--te-card)] px-3 py-2 text-sm text-[var(--te-fg)] outline-none focus:border-[var(--te-accent)]';

export function LoginForm({ action, registerHref = '/register' }: LoginFormProps) {
  const t = useTranslations('auth');
  const [state, formAction, pending] = useActionState(action, INITIAL_AUTH_ACTION_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
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
        {t('login.submit')}
      </button>

      <p className="text-sm text-[var(--te-muted)]">
        {t('login.registerPrompt')}{' '}
        <Link className="underline" href={registerHref}>
          {t('login.registerLink')}
        </Link>
      </p>
    </form>
  );
}
