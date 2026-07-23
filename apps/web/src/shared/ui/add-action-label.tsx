import type { ReactNode } from 'react';

import { cn } from '@/shared/ui/cn';

type AddActionLabelProps = {
  children: string;
  className?: string | undefined;
};

const LEADING_PLUS = /^\+\s*/;

/**
 * Renders “+  Label” with a real flex gap after the plus (not a tight glyph space).
 */
export const AddActionLabel = ({ children, className }: AddActionLabelProps): ReactNode => {
  const label = children.replace(LEADING_PLUS, '');

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span aria-hidden className="text-[1.15em] leading-none font-semibold">
        +
      </span>
      <span>{label}</span>
    </span>
  );
};
