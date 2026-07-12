'use client';

import { useTransition } from 'react';

import { stopActingOnBehalfAction } from '@/lib/builder/active-company-actions';

type ActingOnBehalfBannerProps = {
  locale: string;
  message: string;
  exitLabel: string;
};

/** Banner shown when a platform admin is acting on behalf of a builder company. */
export function ActingOnBehalfBanner({ locale, message, exitLabel }: ActingOnBehalfBannerProps) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="portal-acting-banner" role="status">
      <p className="portal-acting-banner__text">{message}</p>
      <button
        type="button"
        className="portal-btn portal-btn--ghost portal-btn--sm"
        disabled={pending}
        onClick={() => {
          startTransition(() => {
            void stopActingOnBehalfAction(locale);
          });
        }}
      >
        {exitLabel}
      </button>
    </div>
  );
}
