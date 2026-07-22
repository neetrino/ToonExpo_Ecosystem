'use client';

import type { ReactNode } from 'react';

import { SideSheet } from '@/shared/ui/side-sheet';

type AdminCreateSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string | undefined;
  children: ReactNode;
  /** `compact` ≈ 420px; `comfortable` ≈ 500px; `default` ≈ 50vw. */
  size?: 'compact' | 'comfortable' | 'default' | undefined;
};

const LEADING_PLUS = /^\+\s*/;

/**
 * Shared admin create/edit overlay — same MaMarie-style side sheet as New Company.
 * Strips a leading “+” so CTA i18n keys can be reused as sheet titles.
 */
export const AdminCreateSheet = ({
  open,
  onClose,
  title,
  description,
  children,
  size = 'compact',
}: AdminCreateSheetProps) => {
  return (
    <SideSheet
      open={open}
      onClose={onClose}
      size={size}
      title={title.replace(LEADING_PLUS, '')}
      description={description}
    >
      {children}
    </SideSheet>
  );
};
