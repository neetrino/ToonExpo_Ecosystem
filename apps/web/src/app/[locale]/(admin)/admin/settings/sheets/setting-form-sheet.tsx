'use client';

import {
  CONTACT_EMAIL_MAX_LENGTH,
  CONTACT_PHONE_MAX_LENGTH,
  PLATFORM_SETTING_VALUE_MAX_LENGTH,
  type PlatformSettingKey,
} from '@toonexpo/contracts';
import { SideSheet } from '@toonexpo/ui';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { PortalFormError } from '@/components/portal-forms/form-error';
import { PortalFormField, PortalTextInput } from '@/components/portal-forms/form-fields';
import { useCloseOnFormSuccess } from '@/components/portal-forms/use-close-on-form-success';
import { INITIAL_ADMIN_CATALOG_ACTION_STATE } from '@/lib/admin/catalog-action-state';
import { upsertSettingFormAction } from '@/lib/admin/form-actions';

type SettingFormSheetProps = {
  locale: string;
  settingKey: PlatformSettingKey;
  open: boolean;
  onClose: () => void;
  currentValue: string | null;
};

const BOOLEAN_KEYS: PlatformSettingKey[] = ['MORTGAGE_PAGE_ENABLED'];

export function SettingFormSheet({
  locale,
  settingKey,
  open,
  onClose,
  currentValue,
}: SettingFormSheetProps) {
  const t = useTranslations('admin.settings.form');
  const action = upsertSettingFormAction.bind(null, locale);
  const [state, formAction, pending] = useActionState(action, INITIAL_ADMIN_CATALOG_ACTION_STATE);

  useCloseOnFormSuccess(state, open, onClose);

  const isBoolean = BOOLEAN_KEYS.includes(settingKey);

  return (
    <SideSheet title={t('edit')} open={open} onClose={onClose}>
      <form action={formAction} className="portal-form">
        <input type="hidden" name="key" value={settingKey} />

        <PortalFormField label={t('fields.value')} name="value">
          {isBoolean ? (
            <select
              name="value"
              className="portal-input"
              defaultValue={currentValue ?? 'true'}
              required
            >
              <option value="true">{t('boolean.true')}</option>
              <option value="false">{t('boolean.false')}</option>
            </select>
          ) : (
            <PortalTextInput
              name="value"
              type={settingKey === 'CONTACT_EMAIL' ? 'email' : 'text'}
              defaultValue={currentValue ?? undefined}
              required
              maxLength={
                settingKey === 'CONTACT_EMAIL'
                  ? CONTACT_EMAIL_MAX_LENGTH
                  : settingKey === 'CONTACT_PHONE'
                    ? CONTACT_PHONE_MAX_LENGTH
                    : PLATFORM_SETTING_VALUE_MAX_LENGTH
              }
            />
          )}
        </PortalFormField>

        <PortalFormError errorKey={state.errorKey} namespace="admin.catalog.errors" />

        <div className="portal-form__actions">
          <button type="submit" className="portal-btn portal-btn--primary" disabled={pending}>
            {t('submit')}
          </button>
        </div>
      </form>
    </SideSheet>
  );
}
