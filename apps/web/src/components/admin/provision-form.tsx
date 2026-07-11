'use client';

import { PROVISIONABLE_ROLES } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

import {
  INITIAL_PROVISION_ACTION_STATE,
  type ProvisionActionState,
} from '@/lib/admin/action-state';

type ProvisionFormProps = {
  action: (state: ProvisionActionState, formData: FormData) => Promise<ProvisionActionState>;
};

const FIELD_CLASS =
  'w-full rounded border border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--te-accent)]';

export function ProvisionForm({ action }: ProvisionFormProps) {
  const t = useTranslations('admin.provision');
  const tRoles = useTranslations('admin.users.roles');
  const [state, formAction, pending] = useActionState(action, INITIAL_PROVISION_ACTION_STATE);

  return (
    <form
      action={formAction}
      data-testid="provision-account-form"
      className="flex flex-col gap-4 rounded border border-white/10 p-6"
    >
      <h2 className="text-lg font-medium">{t('title')}</h2>
      <p className="text-sm text-[var(--te-muted)]">{t('description')}</p>

      <label className="flex flex-col gap-1 text-sm">
        <span>{t('fields.email')}</span>
        <input className={FIELD_CLASS} type="email" name="email" autoComplete="off" required />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>{t('fields.name')}</span>
        <input className={FIELD_CLASS} type="text" name="name" autoComplete="off" required />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>{t('fields.role')}</span>
        <select className={FIELD_CLASS} name="role" required defaultValue="BUILDER">
          {PROVISIONABLE_ROLES.map((role) => (
            <option key={role} value={role}>
              {tRoles(role)}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>{t('fields.temporaryPassword')}</span>
        <input
          className={FIELD_CLASS}
          type="password"
          name="temporaryPassword"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>{t('fields.companyName')}</span>
        <input className={FIELD_CLASS} type="text" name="companyName" autoComplete="off" />
        <span className="text-xs text-[var(--te-muted)]">{t('fields.companyNameHint')}</span>
      </label>

      {state.errorKey ? (
        <p role="alert" className="text-sm text-red-400">
          {t(`errors.${state.errorKey}`)}
        </p>
      ) : null}

      {state.successKey ? (
        <p role="status" className="text-sm text-green-400">
          {t(`success.${state.successKey}`)}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-[var(--te-accent)] px-4 py-2 text-sm font-medium disabled:opacity-60"
      >
        {t('submit')}
      </button>
    </form>
  );
}
