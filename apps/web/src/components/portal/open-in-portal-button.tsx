'use client';

import { useTransition } from 'react';

import { startActingOnBehalfAction } from '@/lib/builder/active-company-actions';

type OpenInPortalButtonProps = {
  locale: string;
  companyId: string;
  label: string;
};

/** Admin companies row action: start acting-on-behalf and open the builder portal. */
export function OpenInPortalButton({ locale, companyId, label }: OpenInPortalButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="portal-btn portal-btn--ghost portal-btn--sm"
      disabled={pending}
      onClick={() => {
        startTransition(() => {
          void startActingOnBehalfAction(locale, companyId);
        });
      }}
    >
      {label}
    </button>
  );
}
