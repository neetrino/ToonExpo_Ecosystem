'use client';

import {
  EXHIBITION_EVENT_CODE_MAX_LENGTH,
  EXHIBITION_EVENT_NAME_MAX_LENGTH,
} from '@toonexpo/contracts';
import { EXHIBITION_EVENT_STATUSES, type ExhibitionEventStatus } from '@toonexpo/domain';
import { SideSheet } from '@toonexpo/ui';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { PortalFormError } from '@/components/portal-forms/form-error';
import {
  PortalFormField,
  PortalSelect,
  PortalTextInput,
} from '@/components/portal-forms/form-fields';
import { useCloseOnFormSuccess } from '@/components/portal-forms/use-close-on-form-success';
import {
  INITIAL_ADMIN_CATALOG_ACTION_STATE,
} from '@/lib/admin/catalog-action-state';
import { upsertExhibitionEventFormAction } from '@/lib/admin/form-actions';

type EventFormValues = {
  eventId?: string;
  name: string;
  code: string;
  startDate?: string;
  endDate?: string;
  status: ExhibitionEventStatus;
};

type EventFormSheetProps = {
  locale: string;
  mode: 'create' | 'edit';
  open: boolean;
  onClose: () => void;
  values?: EventFormValues;
};

function toDateInputValue(isoOrDate?: string): string {
  if (!isoOrDate) {
    return '';
  }
  if (isoOrDate.includes('T')) {
    return isoOrDate.slice(0, 16);
  }
  return `${isoOrDate.slice(0, 10)}T00:00`;
}

export function EventFormSheet({ locale, mode, open, onClose, values }: EventFormSheetProps) {
  const t = useTranslations('admin.exhibition.form');
  const action = upsertExhibitionEventFormAction.bind(null, locale);
  const [state, formAction, pending] = useActionState(action, INITIAL_ADMIN_CATALOG_ACTION_STATE);

  useCloseOnFormSuccess(state, open, onClose);

  return (
    <SideSheet title={t(mode)} open={open} onClose={onClose}>
      <form action={formAction} className="portal-form">
        {mode === 'edit' && values?.eventId ? (
          <input type="hidden" name="eventId" value={values.eventId} />
        ) : null}

        <PortalFormField label={t('fields.name')} name="name">
          <PortalTextInput
            name="name"
            defaultValue={values?.name}
            required
            maxLength={EXHIBITION_EVENT_NAME_MAX_LENGTH}
          />
        </PortalFormField>

        <PortalFormField label={t('fields.code')} name="code" hint={t('fields.codeHint')}>
          <PortalTextInput
            name="code"
            defaultValue={values?.code}
            required
            maxLength={EXHIBITION_EVENT_CODE_MAX_LENGTH}
          />
        </PortalFormField>

        <PortalFormField label={t('fields.startDate')} name="startDate">
          <PortalTextInput
            name="startDate"
            type="datetime-local"
            defaultValue={toDateInputValue(values?.startDate)}
          />
        </PortalFormField>

        <PortalFormField label={t('fields.endDate')} name="endDate">
          <PortalTextInput
            name="endDate"
            type="datetime-local"
            defaultValue={toDateInputValue(values?.endDate)}
          />
        </PortalFormField>

        <PortalFormField label={t('fields.status')} name="status">
          <PortalSelect name="status" defaultValue={values?.status ?? 'PLANNING'} required>
            {EXHIBITION_EVENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(`statuses.${status}`)}
              </option>
            ))}
          </PortalSelect>
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
