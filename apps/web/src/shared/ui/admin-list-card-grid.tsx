'use client';

import type { ReactNode } from 'react';

import {
  LIST_CARD_DURATION_MS,
  LIST_CARD_STAGGER_MS,
  LIST_CONTENT_BASE_DELAY_MS,
} from '@/shared/ui/motion/list-page-motion';
import { StaggerGroup } from '@/shared/ui/motion/stagger-group';
import { cn } from '@/shared/ui/cn';

type AdminListCardGridProps = {
  children: ReactNode;
  className?: string | undefined;
};

/**
 * Responsive card grid for portal collection views (admin + builder).
 * Plays the same staggered entrance as analytics / companies.
 */
export const AdminListCardGrid = ({ children, className }: AdminListCardGridProps) => {
  return (
    <StaggerGroup
      force
      className={cn(
        'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 [&>*]:h-full [&>*]:min-w-0',
        className,
      )}
      staggerMs={LIST_CARD_STAGGER_MS}
      baseDelayMs={LIST_CONTENT_BASE_DELAY_MS}
      durationMs={LIST_CARD_DURATION_MS}
    >
      {children}
    </StaggerGroup>
  );
};
