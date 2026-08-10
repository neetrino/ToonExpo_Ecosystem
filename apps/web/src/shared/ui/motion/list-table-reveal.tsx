'use client';

import type { ReactNode } from 'react';

import {
  LIST_CONTENT_BASE_DELAY_MS,
  LIST_TABLE_DURATION_MS,
} from '@/shared/ui/motion/list-page-motion';
import { Reveal } from '@/shared/ui/motion/reveal';

type ListTableRevealProps = {
  children: ReactNode;
};

/**
 * Table-mode entrance for async-mounted collection views.
 */
export const ListTableReveal = ({ children }: ListTableRevealProps) => (
  <Reveal force delayMs={LIST_CONTENT_BASE_DELAY_MS} durationMs={LIST_TABLE_DURATION_MS}>
    {children}
  </Reveal>
);
