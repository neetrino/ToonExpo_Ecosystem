'use client';

import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { PortalFormError } from '@/components/portal-forms/form-error';
import { regenerateBuyerQrAction, revokeBuyerQrAction } from '@/app/[locale]/q/actions';
import {
  INITIAL_REGENERATE_QR_FORM_STATE,
  type RegenerateQrFormState,
} from '@/app/[locale]/q/regenerate-form-state';

type BuyerQrSectionProps = {
  locale: string;
  qrSvg: string | null;
  revoked: boolean;
  payloadUrl: string | null;
};

export function BuyerQrSection({ locale, qrSvg, revoked, payloadUrl }: BuyerQrSectionProps) {
  const t = useTranslations('buyer.qr');
  const regenerateAction = regenerateBuyerQrAction.bind(null, locale);
  const revokeAction = revokeBuyerQrAction.bind(null, locale);
  const [regenState, regenFormAction, regenPending] = useActionState(
    regenerateAction,
    INITIAL_REGENERATE_QR_FORM_STATE,
  );
  const [revokeState, revokeFormAction, revokePending] = useActionState(
    revokeAction,
    INITIAL_REGENERATE_QR_FORM_STATE,
  );

  const pending = regenPending || revokePending;

  return (
    <section id="my-qr" className="buyer-qr">
      <header className="buyer-qr__header">
        <h2 className="buyer-qr__title">{t('title')}</h2>
        <p className="buyer-qr__subtitle">{t('subtitle')}</p>
      </header>

      {revoked || !qrSvg ? (
        <p className="buyer-qr__revoked">{t('revoked')}</p>
      ) : (
        <div className="buyer-qr__display">
          <div
            className="buyer-qr__image"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
            role="img"
            aria-label={t('ariaLabel')}
          />
          {payloadUrl ? <p className="buyer-qr__url">{payloadUrl}</p> : null}
          <p className="buyer-qr__hint">{t('hint')}</p>
        </div>
      )}

      <div className="buyer-qr__actions">
        {!revoked && qrSvg ? (
          <form
            action={revokeFormAction}
            className="buyer-qr__action-form"
            onSubmit={(event) => {
              if (!window.confirm(t('revokeConfirm'))) {
                event.preventDefault();
              }
            }}
          >
            <PortalFormError errorKey={getErrorKey(revokeState)} namespace="buyer.qr.errors" />
            {'success' in revokeState && revokeState.success ? (
              <p className="buyer-qr__success">{t('revokeSuccess')}</p>
            ) : null}
            <button type="submit" className="portal-btn portal-btn--ghost" disabled={pending}>
              {t('revoke')}
            </button>
          </form>
        ) : null}

        <form
          action={regenFormAction}
          className="buyer-qr__action-form"
          onSubmit={(event) => {
            if (!window.confirm(t('regenerateConfirm'))) {
              event.preventDefault();
            }
          }}
        >
          <PortalFormError errorKey={getErrorKey(regenState)} namespace="buyer.qr.errors" />
          {'success' in regenState && regenState.success ? (
            <p className="buyer-qr__success">{t('regenerateSuccess')}</p>
          ) : null}
          <button type="submit" className="portal-btn portal-btn--ghost" disabled={pending}>
            {t('regenerate')}
          </button>
        </form>
      </div>
    </section>
  );
}

function getErrorKey(state: RegenerateQrFormState): string | undefined {
  if ('errorKey' in state) {
    return state.errorKey;
  }
  return undefined;
}
