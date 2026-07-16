'use client';

import { useState } from 'react';

import { PartnerFormSheet } from './sheets/partner-form-sheet';

type NewPartnerButtonProps = {
  locale: string;
  label: string;
};

export function NewPartnerButton({ locale, label }: NewPartnerButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="portal-btn portal-btn--primary"
        onClick={() => setOpen(true)}
      >
        {label}
      </button>
      <PartnerFormSheet locale={locale} mode="create" open={open} onClose={() => setOpen(false)} />
    </>
  );
}
