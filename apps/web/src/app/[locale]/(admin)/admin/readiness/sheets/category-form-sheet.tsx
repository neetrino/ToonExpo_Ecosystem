'use client';

import {
  READINESS_CATEGORY_DESCRIPTION_MAX_LENGTH,
  READINESS_CATEGORY_KEY_MAX_LENGTH,
  READINESS_CATEGORY_NAME_MAX_LENGTH,
  READINESS_CATEGORY_SERVICE_KEY_MAX_LENGTH,
  READINESS_CATEGORY_SORT_ORDER_MAX,
  READINESS_CATEGORY_WEIGHT_MAX,
} from '@toonexpo/contracts';
import { SideSheet } from '@toonexpo/ui';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { PortalFormError } from '@/components/portal-forms/form-error';
import {
  PortalFormField,
  PortalTextArea,
  PortalTextInput,
} from '@/components/portal-forms/form-fields';
import { useCloseOnFormSuccess } from '@/components/portal-forms/use-close-on-form-success';
import {
  INITIAL_ADMIN_CATALOG_ACTION_STATE,
  type AdminCatalogActionState,
} from '@/lib/admin/catalog-action-state';
import { upsertReadinessCategoryFormAction } from '@/lib/admin/form-actions';
import type { AdminReadinessCategoryRow } from '@/lib/admin/readiness-queries';

type CategoryFormSheetProps = {
  locale: string;
  mode: 'create' | 'edit';
  open: boolean;
  onClose: () => void;
  values?: AdminReadinessCategoryRow;
};

export function CategoryFormSheet({ locale, mode, open, onClose, values }: CategoryFormSheetProps) {
  const t = useTranslations('admin.readiness.categoryForm');
  const action = upsertReadinessCategoryFormAction.bind(null, locale);
  const [state, formAction, pending] = useActionState(action, INITIAL_ADMIN_CATALOG_ACTION_STATE);

  useCloseOnFormSuccess(state, open, onClose);

  return (
    <SideSheet title={t(mode)} open={open} onClose={onClose}>
      <CategoryFormBody
        mode={mode}
        values={values}
        state={state}
        formAction={formAction}
        pending={pending}
      />
    </SideSheet>
  );
}

type CategoryFormBodyProps = {
  mode: 'create' | 'edit';
  values?: AdminReadinessCategoryRow;
  state: AdminCatalogActionState;
  formAction: (formData: FormData) => void;
  pending: boolean;
};

function CategoryFormBody({ mode, values, state, formAction, pending }: CategoryFormBodyProps) {
  const t = useTranslations('admin.readiness.categoryForm');

  return (
    <form action={formAction} className="portal-form">
      {mode === 'edit' && values ? (
        <input type="hidden" name="categoryId" value={values.id} />
      ) : null}
      <CategoryIdentityFields mode={mode} values={values} />
      <CategoryScoringFields values={values} />
      <CategoryActiveField defaultChecked={values?.active ?? true} />
      <PortalFormError errorKey={state.errorKey} namespace="admin.catalog.errors" />
      <div className="portal-form__actions">
        <button type="submit" className="portal-btn portal-btn--primary" disabled={pending}>
          {t('submit')}
        </button>
      </div>
    </form>
  );
}

function CategoryIdentityFields({
  mode,
  values,
}: {
  mode: 'create' | 'edit';
  values?: AdminReadinessCategoryRow;
}) {
  const t = useTranslations('admin.readiness.categoryForm');

  return (
    <>
      <PortalFormField
        label={t('fields.key')}
        name="key"
        hint={mode === 'edit' ? t('fields.keyHint') : t('fields.keyCreateHint')}
      >
        <PortalTextInput
          name="key"
          defaultValue={values?.key}
          required={mode === 'create'}
          readOnly={mode === 'edit'}
          maxLength={READINESS_CATEGORY_KEY_MAX_LENGTH}
        />
      </PortalFormField>
      <PortalFormField label={t('fields.name')} name="name">
        <PortalTextInput
          name="name"
          defaultValue={values?.name}
          required
          maxLength={READINESS_CATEGORY_NAME_MAX_LENGTH}
        />
      </PortalFormField>
      <PortalFormField label={t('fields.description')} name="description">
        <PortalTextArea
          name="description"
          defaultValue={values?.description ?? undefined}
          maxLength={READINESS_CATEGORY_DESCRIPTION_MAX_LENGTH}
          rows={3}
        />
      </PortalFormField>
    </>
  );
}

function CategoryScoringFields({ values }: { values?: AdminReadinessCategoryRow }) {
  const t = useTranslations('admin.readiness.categoryForm');

  return (
    <>
      <PortalFormField label={t('fields.weight')} name="weight">
        <PortalTextInput
          name="weight"
          type="number"
          min={0}
          max={READINESS_CATEGORY_WEIGHT_MAX}
          defaultValue={values?.weight ?? undefined}
        />
      </PortalFormField>
      <PortalFormField label={t('fields.sortOrder')} name="sortOrder">
        <PortalTextInput
          name="sortOrder"
          type="number"
          min={0}
          max={READINESS_CATEGORY_SORT_ORDER_MAX}
          defaultValue={values?.sortOrder ?? 0}
          required
        />
      </PortalFormField>
      <PortalFormField
        label={t('fields.serviceCategoryKey')}
        name="serviceCategoryKey"
        hint={t('fields.serviceCategoryKeyHint')}
      >
        <PortalTextInput
          name="serviceCategoryKey"
          defaultValue={values?.serviceCategoryKey ?? undefined}
          maxLength={READINESS_CATEGORY_SERVICE_KEY_MAX_LENGTH}
        />
      </PortalFormField>
    </>
  );
}

function CategoryActiveField({ defaultChecked }: { defaultChecked: boolean }) {
  const t = useTranslations('admin.readiness.categoryForm');

  return (
    <label className="portal-form__field" htmlFor="active">
      <span className="portal-form__label">{t('fields.active')}</span>
      <input
        id="active"
        name="active"
        type="checkbox"
        className="portal-form__checkbox"
        defaultChecked={defaultChecked}
        value="true"
      />
    </label>
  );
}
