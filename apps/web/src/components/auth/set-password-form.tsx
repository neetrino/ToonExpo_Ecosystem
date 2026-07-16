'use client';

import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

import {
  INITIAL_INVITE_ACTION_STATE,
  type InviteActionState,
} from '@/lib/auth/invite-action-state';
import { TeButton } from '@/components/ui/te-button';

type SetPasswordFormProps = {
  action: (state: InviteActionState, formData: FormData) => Promise<InviteActionState>;
};

const FIELD_CLASS =
  'w-full rounded-md border border-[var(--te-border)] bg-[var(--te-card)] px-3 py-2 text-sm text-[var(--te-fg)] outline-none focus:border-[var(--te-accent)]';

export function SetPasswordForm({ action }: SetPasswordFormProps) {
  const t = useTranslations('auth.invite');
  const [state, formAction, pending] = useActionState(action, INITIAL_INVITE_ACTION_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
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

      {state.errorKey ? (
        <p role="alert" className="text-sm text-[#b91c1c]">
          {t(`errors.${state.errorKey}`)}
        </p>
      ) : null}

      <TeButton type="submit" disabled={pending}>
        {t('submit')}
      </TeButton>
    </form>
  );
}
