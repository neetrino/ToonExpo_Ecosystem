'use client';

import { useState } from 'react';

import { EventFormSheet } from './sheets/event-form-sheet';

type NewEventButtonProps = {
  locale: string;
  label: string;
};

export function NewEventButton({ locale, label }: NewEventButtonProps) {
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
      <EventFormSheet locale={locale} mode="create" open={open} onClose={() => setOpen(false)} />
    </>
  );
}
