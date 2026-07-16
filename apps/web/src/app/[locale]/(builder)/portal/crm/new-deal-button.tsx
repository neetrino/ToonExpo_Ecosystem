'use client';

import { useState } from 'react';

import { ManualDealSheet } from './sheets/manual-deal-sheet';

type ManualDealProjectOption = {
  id: string;
  name: string;
};

type NewDealButtonProps = {
  locale: string;
  label: string;
  projects: ManualDealProjectOption[];
  onCreated?: (dealId: string) => void;
};

export function NewDealButton({ locale, label, projects, onCreated }: NewDealButtonProps) {
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
      <ManualDealSheet
        locale={locale}
        open={open}
        onClose={() => setOpen(false)}
        projects={projects}
        onCreated={onCreated}
      />
    </>
  );
}
