'use client';

import { ChevronDown } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';

import { cn } from '@/shared/ui/cn';

type ProjectCatalogCollapsibleProps = {
  title: string;
  children: ReactNode;
  /** When true, section starts expanded. */
  defaultOpen?: boolean | undefined;
};

/**
 * Accordion section for project catalog blocks (About, Key facts, …).
 */
export const ProjectCatalogCollapsible = ({
  title,
  children,
  defaultOpen = false,
}: ProjectCatalogCollapsibleProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div>
      <button
        type="button"
        className={cn(
          'inline-flex items-center gap-2 text-left',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25',
        )}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <h3 className="text-[13px] font-bold tracking-[0.18em] text-brand-secondary uppercase">
          {title}
        </h3>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-brand-deep transition-transform duration-[var(--duration-fast)]',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>
      {open ? (
        <div id={panelId} className="mt-4">
          {children}
        </div>
      ) : null}
    </div>
  );
};
