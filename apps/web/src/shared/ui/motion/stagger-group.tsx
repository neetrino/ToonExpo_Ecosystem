'use client';

import { Children, type ReactNode, isValidElement } from 'react';

import { Reveal } from '@/shared/ui/motion/reveal';
import { cn } from '@/shared/ui/cn';

const DEFAULT_STAGGER_MS = 60;
const MAX_STAGGER_ITEMS = 12;

type StaggerGroupProps = {
  children: ReactNode;
  className?: string | undefined;
  /** Delay between consecutive children (ms). */
  staggerMs?: number | undefined;
  /** Base delay before the first child (ms). */
  baseDelayMs?: number | undefined;
  as?: 'div' | 'ul' | 'ol' | 'section' | undefined;
  /** Always play entrance (for async-mounted dashboards). */
  force?: boolean | undefined;
  /** Per-item reveal duration (ms). */
  durationMs?: number | undefined;
  /** Optional DOM id (e.g. catalog scroll target). */
  id?: string | undefined;
};

/**
 * Wraps each child in Reveal with incremental delay for grid/list entrance.
 */
export const StaggerGroup = ({
  children,
  className,
  staggerMs = DEFAULT_STAGGER_MS,
  baseDelayMs = 0,
  as: Tag = 'div',
  force = false,
  durationMs,
  id,
}: StaggerGroupProps) => {
  const items = Children.toArray(children).filter(isValidElement);

  return (
    <Tag id={id} className={cn(className)}>
      {items.map((child, index) => {
        const cappedIndex = Math.min(index, MAX_STAGGER_ITEMS - 1);
        return (
          <Reveal
            key={child.key ?? index}
            className="h-full min-w-0 [&>*]:h-full"
            delayMs={baseDelayMs + cappedIndex * staggerMs}
            force={force}
            {...(durationMs != null ? { durationMs } : {})}
          >
            {child}
          </Reveal>
        );
      })}
    </Tag>
  );
};
