import type { ReactNode } from 'react';

import { cn } from '@/shared/ui/cn';

/** Keeps the last fields clear of the fixed save bar. */
export const FORM_SAVE_BAR_SCROLL_CLEARANCE_CLASS = 'pb-24';

/**
 * Fixed save chrome — always visible while scrolling.
 * Desktop inset matches the expanded portal rail (`w-72`).
 */
const SAVE_BAR_CLASS_NAME = cn(
  'fixed inset-x-0 bottom-0 z-[var(--z-sticky)]',
  'border-t border-border bg-surface-elevated/95 backdrop-blur-md',
  'px-[var(--page-gutter)] pt-3',
  'pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]',
  'md:left-72',
);

type FormSaveBarProps = {
  children: ReactNode;
};

/**
 * Sticky footer for long portal edit forms (project, apartment).
 */
export const FormSaveBar = ({ children }: FormSaveBarProps) => (
  <div className={SAVE_BAR_CLASS_NAME}>
    <div className="mx-auto flex w-full max-w-[var(--max-width-wide)] flex-col gap-2">{children}</div>
  </div>
);
