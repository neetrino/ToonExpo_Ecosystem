'use client';

import type { ReactNode } from 'react';

import { SideSheet } from '@/shared/ui/side-sheet';

type AdminCreateSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string | undefined;
  children: ReactNode;
  /** Pinned under the scrolling body. Stays visible while the sheet content scrolls. */
  footer?: ReactNode | undefined;
  headerActions?: ReactNode | undefined;
  /** `compact` ≈ 420px; `comfortable` ≈ 500px; `wide` ≈ 640px; `default` ≈ 50vw. */
  size?: 'compact' | 'comfortable' | 'wide' | 'default' | undefined;
  /** Nested sheet level (0 = base). */
  stackLevel?: number | undefined;
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
  footer,
  headerActions,
  size = 'compact',
  stackLevel,
}: AdminCreateSheetProps) => {
  return (
    <SideSheet
      open={open}
      onClose={onClose}
      size={size}
      title={title.replace(LEADING_PLUS, '')}
      description={description}
      headerActions={headerActions}
      footer={footer}
      stackLevel={stackLevel}
    >
      {children}
    </SideSheet>
  );
};
