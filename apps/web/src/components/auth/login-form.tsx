'use client';

import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { Link } from '@/i18n/navigation';
import { type AuthActionState, INITIAL_AUTH_ACTION_STATE } from '@/lib/auth/action-state';
import { TeButton } from '@/components/ui/te-button';

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
        <p role="alert" className="text-sm text-[#b91c1c]">
          {t(`errors.${state.errorKey}`)}
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
