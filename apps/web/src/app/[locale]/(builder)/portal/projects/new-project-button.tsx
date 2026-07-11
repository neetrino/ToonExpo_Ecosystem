'use client';

import { useState } from 'react';

import { ProjectFormSheet } from './sheets/project-form-sheet';

type NewProjectButtonProps = {
  locale: string;
  label: string;
};

export function NewProjectButton({ locale, label }: NewProjectButtonProps) {
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
      <ProjectFormSheet locale={locale} mode="create" open={open} onClose={() => setOpen(false)} />
    </>
  );
}
