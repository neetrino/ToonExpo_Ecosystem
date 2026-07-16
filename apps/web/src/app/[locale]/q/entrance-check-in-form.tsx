'use client';

import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { PortalFormError } from '@/components/portal-forms/form-error';

import { performCheckInAction } from './check-in-actions';
import { INITIAL_CHECK_IN_FORM_STATE, type CheckInFormState } from './check-in-form-state';

type EntranceCheckInFormProps = {
  locale: string;
  qrToken: string;
  eventId: string | null;
  buyerName: string;
};

async function checkInFormAction(
  locale: string,
  qrToken: string,
  eventId: string | null,
  _prev: CheckInFormState,
  _formData: FormData,
): Promise<CheckInFormState> {
  const result = await performCheckInAction(locale, {
    qrToken,
    eventId: eventId ?? undefined,
  });

  if (!result.ok) {
    return { errorKey: result.errorKey };
  }

  return { success: true, alreadyCheckedIn: result.alreadyCheckedIn };
}

export function EntranceCheckInForm({
  locale,
  qrToken,
  eventId,
  buyerName,
}: EntranceCheckInFormProps) {
  const t = useTranslations('qr.entrance');
  const action = checkInFormAction.bind(null, locale, qrToken, eventId);
  const [state, formAction, pending] = useActionState(action, INITIAL_CHECK_IN_FORM_STATE);

  if ('success' in state && state.success) {
    return (
      <div className="qr-scan-success">
        <p className="qr-scan-success__message">
          {state.alreadyCheckedIn ? t('successDuplicate') : t('successNew')}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="portal-form qr-scan-form">
      <dl className="qr-scan-buyer">
        <div>
          <dt>{t('fields.name')}</dt>
          <dd>{buyerName}</dd>
        </div>
      </dl>

      {!eventId ? <p className="portal-empty">{t('noActiveEvent')}</p> : null}

      {'errorKey' in state && state.errorKey ? (
        <PortalFormError errorKey={state.errorKey} namespace="qr.entrance.errors" />
      ) : null}

      <div className="portal-form__actions">
        <button
          type="submit"
          className="portal-btn portal-btn--primary"
          disabled={pending || !eventId}
        >
          {t('submit')}
        </button>
      </div>
    </form>
  );
}
