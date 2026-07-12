'use client';

import {
  MEDIA_ALT_MAX_LENGTH,
  MEDIA_SORT_ORDER_MAX,
  MEDIA_SORT_ORDER_MIN,
} from '@toonexpo/contracts';
import { SideSheet } from '@toonexpo/ui';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { PortalFormError } from '@/components/portal-forms/form-error';
import {
  PortalFormField,
  PortalTextInput,
} from '@/components/portal-forms/form-fields';
import { useCloseOnFormSuccess } from '@/components/portal-forms/use-close-on-form-success';

import {
  INITIAL_BUILDER_FORM_ACTION_STATE,
  type BuilderFormActionState,
} from '@/lib/builder/action-state';
import {
  addMediaAssetFormAction,
  updateMediaAssetFormAction,
} from '@/lib/builder/form-actions';
import type { BuilderMediaAsset } from '@/lib/builder/queries';

type MediaOwnerValues = {
  projectId?: string;
  apartmentId?: string;
};

type MediaFormValues = MediaOwnerValues & {
  mediaAssetId?: string;
  url: string;
  alt?: string | null;
  sortOrder: number;
};

type MediaFormSheetProps = {
  locale: string;
  mode: 'create' | 'edit';
  open: boolean;
  onClose: () => void;
  values: MediaFormValues;
};

export function MediaFormSheet({ locale, mode, open, onClose, values }: MediaFormSheetProps) {
  const t = useTranslations('portal.mediaForm');
  const action =
    mode === 'create'
      ? addMediaAssetFormAction.bind(null, locale)
      : updateMediaAssetFormAction.bind(null, locale);

  const [state, formAction, pending] = useActionState(action, INITIAL_BUILDER_FORM_ACTION_STATE);

  useCloseOnFormSuccess(state, open, onClose);

  return (
    <SideSheet title={t(mode)} open={open} onClose={onClose}>
      <MediaFormBody
        mode={mode}
        values={values}
        state={state}
        formAction={formAction}
        pending={pending}
      />
    </SideSheet>
  );
}

type MediaFormBodyProps = {
  mode: 'create' | 'edit';
  values: MediaFormValues;
  state: BuilderFormActionState;
  formAction: (formData: FormData) => void;
  pending: boolean;
};

function MediaFormBody({ mode, values, state, formAction, pending }: MediaFormBodyProps) {
  const t = useTranslations('portal.mediaForm');

  return (
    <form action={formAction} className="portal-form">
      {mode === 'edit' && values.mediaAssetId ? (
        <input type="hidden" name="mediaAssetId" value={values.mediaAssetId} />
      ) : null}
      {values.projectId ? <input type="hidden" name="projectId" value={values.projectId} /> : null}
      {values.apartmentId ? (
        <input type="hidden" name="apartmentId" value={values.apartmentId} />
      ) : null}

      <p className="portal-form__hint">{t('uploadHint')}</p>

      <PortalFormField label={t('fields.url')} name="url">
        <PortalTextInput name="url" type="text" defaultValue={values.url} required />
      </PortalFormField>

      <PortalFormField label={t('fields.alt')} name="alt">
        <PortalTextInput
          name="alt"
          defaultValue={values.alt ?? undefined}
          maxLength={MEDIA_ALT_MAX_LENGTH}
        />
      </PortalFormField>

      <PortalFormField label={t('fields.sortOrder')} name="sortOrder" hint={t('fields.sortOrderHint')}>
        <PortalTextInput
          name="sortOrder"
          type="number"
          defaultValue={String(values.sortOrder)}
          min={MEDIA_SORT_ORDER_MIN}
          max={MEDIA_SORT_ORDER_MAX}
          required
        />
      </PortalFormField>

      <PortalFormError errorKey={state.errorKey} />

      <div className="portal-form__actions">
        <button type="submit" className="portal-btn portal-btn--primary" disabled={pending}>
          {t('submit')}
        </button>
      </div>
    </form>
  );
}

export type { MediaFormValues, MediaOwnerValues };

export function mediaAssetToFormValues(
  asset: BuilderMediaAsset,
  owner: MediaOwnerValues,
): MediaFormValues {
  return {
    mediaAssetId: asset.id,
    ...owner,
    url: asset.url,
    alt: asset.alt,
    sortOrder: asset.sortOrder,
  };
}
