'use client';

import { useState } from 'react';

import { CompanyFormSheet } from './sheets/company-form-sheet';

type NewCompanyButtonProps = {
  locale: string;
  label: string;
};

export function NewCompanyButton({ locale, label }: NewCompanyButtonProps) {
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
      <CompanyFormSheet locale={locale} mode="create" open={open} onClose={() => setOpen(false)} />
    </>
  );
}
