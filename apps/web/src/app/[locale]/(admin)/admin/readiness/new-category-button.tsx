'use client';

import { useState } from 'react';

import { CategoryFormSheet } from './sheets/category-form-sheet';

type NewCategoryButtonProps = {
  locale: string;
  label: string;
};

export function NewCategoryButton({ locale, label }: NewCategoryButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="portal-btn portal-btn--ghost" onClick={() => setOpen(true)}>
        {label}
      </button>
      <CategoryFormSheet
        locale={locale}
        mode="create"
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
