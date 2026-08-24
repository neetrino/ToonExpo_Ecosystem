'use client';

import { X } from 'lucide-react';

import type { ActiveIntegratedFilterChip } from '@/shared/ui/integrated-search-filters.types';
import { cn } from '@/shared/ui/cn';

type IntegratedSearchFilterChipsProps = {
  chips: readonly ActiveIntegratedFilterChip[];
  onRemove: (key: string) => void;
  removeAriaLabel: (chipLabel: string) => string;
};

export const IntegratedSearchFilterChips = ({
  chips,
  onRemove,
  removeAriaLabel,
}: IntegratedSearchFilterChipsProps) => {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex min-w-0 flex-nowrap items-center gap-1 pe-1 max-md:overflow-x-auto">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className={cn(
            'inline-flex max-w-[10rem] shrink-0 items-center gap-1 rounded-md bg-brand-soft px-1.5 py-0.5',
            'text-[11px] font-medium text-brand',
          )}
        >
          <span className="truncate">{chip.label}</span>
          <button
            type="button"
            className="rounded p-0.5 hover:bg-brand/15"
            aria-label={removeAriaLabel(chip.label)}
            onClick={(event) => {
              event.stopPropagation();
              onRemove(chip.key);
            }}
          >
            <X className="size-3" aria-hidden />
          </button>
        </span>
      ))}
    </div>
  );
};
