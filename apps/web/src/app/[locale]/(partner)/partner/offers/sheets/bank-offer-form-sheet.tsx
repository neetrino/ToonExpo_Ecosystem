'use client';

import {
  BANK_OFFER_DESCRIPTION_MAX_LENGTH,
  BANK_OFFER_TITLE_MAX_LENGTH,
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
  INITIAL_PARTNER_FORM_ACTION_STATE,
  type PartnerFormActionState,
} from '@/lib/partner/action-state';
import {
  createOwnBankOfferFormAction,
  updateOwnBankOfferFormAction,
} from '@/lib/partner/form-actions';

type BankOfferFormValues = {
  bankOfferId?: string;
  title: string;
  description?: string | null;
  interestRate: number;
  minDownPaymentPercent: number;
  maxTermMonths: number;
  maxAmountAmd?: number | null;
  featured?: boolean;
};

type PartnerBankOfferFormSheetProps = {
  locale: string;
  mode: 'create' | 'edit';
  open: boolean;
  onClose: () => void;
  values: BankOfferFormValues;
};

export function PartnerBankOfferFormSheet({
  locale,
  mode,
  open,
  onClose,
  values,
}: PartnerBankOfferFormSheetProps) {
  const t = useTranslations('partnerCabinet.offers.form');
  const action =
    mode === 'create'
      ? createOwnBankOfferFormAction.bind(null, locale)
      : updateOwnBankOfferFormAction.bind(null, locale);

  const [state, formAction, pending] = useActionState(action, INITIAL_PARTNER_FORM_ACTION_STATE);

  useCloseOnFormSuccess(state, open, onClose);

  return (
    <SideSheet title={t(mode)} open={open} onClose={onClose}>
      <PartnerBankOfferFormBody
        mode={mode}
        values={values}
        state={state}
        formAction={formAction}
        pending={pending}
      />
    </SideSheet>
  );
}

type PartnerBankOfferFormBodyProps = {
  mode: 'create' | 'edit';
  values: BankOfferFormValues;
  state: PartnerFormActionState;
  formAction: (formData: FormData) => void;
  pending: boolean;
};

function PartnerBankOfferFormBody({
  mode,
  values,
  state,
  formAction,
  pending,
}: PartnerBankOfferFormBodyProps) {
  const t = useTranslations('partnerCabinet.offers.form');

  return (
    <form action={formAction} className="portal-form">
      {mode === 'edit' && values.bankOfferId ? (
        <input type="hidden" name="bankOfferId" value={values.bankOfferId} />
      ) : null}

      <PortalFormField label={t('fields.title')} name="title">
        <PortalTextInput
          name="title"
          defaultValue={values.title}
          required
          maxLength={BANK_OFFER_TITLE_MAX_LENGTH}
        />
      </PortalFormField>

      <PortalFormField label={t('fields.interestRate')} name="interestRate">
        <PortalTextInput
          name="interestRate"
          type="number"
          defaultValue={String(values.interestRate)}
          required
        />
      </PortalFormField>

      <PortalFormField label={t('fields.minDownPaymentPercent')} name="minDownPaymentPercent">
        <PortalTextInput
          name="minDownPaymentPercent"
          type="number"
          defaultValue={String(values.minDownPaymentPercent)}
          required
        />
      </PortalFormField>

      <PortalFormField label={t('fields.maxTermMonths')} name="maxTermMonths">
        <PortalTextInput
          name="maxTermMonths"
          type="number"
          defaultValue={String(values.maxTermMonths)}
          required
        />
      </PortalFormField>

      <PortalFormField label={t('fields.maxAmountAmd')} name="maxAmountAmd">
        <PortalTextInput
          name="maxAmountAmd"
          type="number"
          defaultValue={values.maxAmountAmd != null ? String(values.maxAmountAmd) : undefined}
        />
      </PortalFormField>

      <PortalFormField label={t('fields.description')} name="description">
        <PortalTextArea
          name="description"
          defaultValue={values.description ?? undefined}
          maxLength={BANK_OFFER_DESCRIPTION_MAX_LENGTH}
        />
      </PortalFormField>

      <label className="portal-form__field" htmlFor="partner-featured">
        <span className="portal-form__label">{t('fields.featured')}</span>
        <input
          id="partner-featured"
          name="featured"
          type="checkbox"
          className="portal-form__checkbox"
          defaultChecked={values.featured ?? false}
          value="true"
        />
      </label>

      <PortalFormError errorKey={state.errorKey} namespace="partnerCabinet.errors" />

      <div className="portal-form__actions">
        <button type="submit" className="portal-btn portal-btn--primary" disabled={pending}>
          {t('submit')}
        </button>
      </div>
    </form>
  );
}
