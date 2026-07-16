'use client';

import { APARTMENT_CODE_MAX_LENGTH } from '@toonexpo/contracts';
import {
  APARTMENT_STATUSES,
  PRICE_VISIBILITIES,
  type ApartmentStatus,
  type PriceVisibility,
} from '@toonexpo/domain';
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
  INITIAL_BUILDER_FORM_ACTION_STATE,
  type BuilderFormActionState,
} from '@/lib/builder/action-state';
import { upsertApartmentFormAction } from '@/lib/builder/form-actions';
import type { BuilderApartmentStatusHistoryEntry } from '@/lib/builder/queries';

type ApartmentFormValues = {
  apartmentId?: string;
  floorId: string;
  code: string;
  rooms?: number | null;
  areaSqm?: number | null;
  priceAmd?: number | null;
  priceVisibility?: PriceVisibility;
  matterportUrl?: string | null;
  status: ApartmentStatus;
  statusHistory?: BuilderApartmentStatusHistoryEntry[];
};

type ApartmentFormSheetProps = {
  locale: string;
  mode: 'create' | 'edit';
  open: boolean;
  onClose: () => void;
  values: ApartmentFormValues;
};

export function ApartmentFormSheet({
  locale,
  mode,
  open,
  onClose,
  values,
}: ApartmentFormSheetProps) {
  const t = useTranslations('portal.apartmentForm');
  const [state, formAction, pending] = useActionState(
    upsertApartmentFormAction.bind(null, locale),
    INITIAL_BUILDER_FORM_ACTION_STATE,
  );

  useCloseOnFormSuccess(state, open, onClose);

  return (
    <SideSheet title={t(mode)} open={open} onClose={onClose}>
      <ApartmentFormBody
        mode={mode}
        values={values}
        state={state}
        formAction={formAction}
        pending={pending}
      />
    </SideSheet>
  );
}

type ApartmentFormBodyProps = {
  mode: 'create' | 'edit';
  values: ApartmentFormValues;
  state: BuilderFormActionState;
  formAction: (formData: FormData) => void;
  pending: boolean;
};

function ApartmentFormBody({ mode, values, state, formAction, pending }: ApartmentFormBodyProps) {
  const t = useTranslations('portal.apartmentForm');
  const tStatus = useTranslations('portal.apartmentStatus');
  const tVisibility = useTranslations('portal.priceVisibility');

  return (
    <form action={formAction} className="portal-form">
      <input type="hidden" name="floorId" value={values.floorId} />
      {mode === 'edit' && values.apartmentId ? (
        <input type="hidden" name="apartmentId" value={values.apartmentId} />
      ) : null}

      <PortalFormField label={t('fields.code')} name="code">
        <PortalTextInput
          name="code"
          defaultValue={values.code}
          required
          maxLength={APARTMENT_CODE_MAX_LENGTH}
        />
      </PortalFormField>

      <PortalFormField label={t('fields.rooms')} name="rooms">
        <PortalTextInput
          name="rooms"
          type="number"
          defaultValue={values.rooms != null ? String(values.rooms) : undefined}
        />
      </PortalFormField>

      <PortalFormField label={t('fields.areaSqm')} name="areaSqm">
        <PortalTextInput
          name="areaSqm"
          type="number"
          defaultValue={values.areaSqm != null ? String(values.areaSqm) : undefined}
        />
      </PortalFormField>

      <PortalFormField label={t('fields.priceAmd')} name="priceAmd">
        <PortalTextInput
          name="priceAmd"
          type="number"
          defaultValue={values.priceAmd != null ? String(values.priceAmd) : undefined}
        />
      </PortalFormField>

      <PortalFormField label={t('fields.priceVisibility')} name="priceVisibility">
        <PortalSelect
          name="priceVisibility"
          defaultValue={values.priceVisibility ?? 'PUBLIC'}
          required
        >
          {PRICE_VISIBILITIES.map((visibility) => (
            <option key={visibility} value={visibility}>
              {tVisibility(visibility)}
            </option>
          ))}
        </PortalSelect>
      </PortalFormField>

      <PortalFormField label={t('fields.matterportUrl')} name="matterportUrl">
        <PortalTextInput
          name="matterportUrl"
          type="text"
          defaultValue={values.matterportUrl ?? undefined}
        />
      </PortalFormField>

      <PortalFormField label={t('fields.status')} name="status">
        <PortalSelect name="status" defaultValue={values.status} required>
          {APARTMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {tStatus(status)}
            </option>
          ))}
        </PortalSelect>
      </PortalFormField>

      {mode === 'edit' ? <ApartmentStatusHistoryList entries={values.statusHistory ?? []} /> : null}

      <PortalFormError errorKey={state.errorKey} />

      <div className="portal-form__actions">
        <button type="submit" className="portal-btn portal-btn--primary" disabled={pending}>
          {t('submit')}
        </button>
      </div>
    </form>
  );
}

function ApartmentStatusHistoryList({
  entries,
}: {
  entries: BuilderApartmentStatusHistoryEntry[];
}) {
  const t = useTranslations('portal.apartmentForm');
  const tStatus = useTranslations('portal.apartmentStatus');
  const tSource = useTranslations('portal.apartmentStatusHistorySource');

  return (
    <details className="portal-form__details">
      <summary className="portal-form__details-summary">{t('statusHistory.title')}</summary>
      {entries.length === 0 ? (
        <p className="portal-form__hint">{t('statusHistory.empty')}</p>
      ) : (
        <ul className="portal-form__history-list">
          {entries.map((entry) => (
            <li key={entry.id} className="portal-form__history-item">
              <span>
                {tStatus(entry.oldStatus)} → {tStatus(entry.newStatus)}
              </span>
              <span className="portal-form__meta">
                {tSource(entry.source)} · {formatHistoryTimestamp(entry.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}

function formatHistoryTimestamp(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toLocaleString();
}
