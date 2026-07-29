'use client';

import { Check } from 'lucide-react';

import { HERO_FILTER_CHECK_CLASS } from '@/features/catalog/components/hero-filter-menu-styles';
import { cn } from '@/shared/ui/cn';

type SelectionMarkProps = {
  checked: boolean;
};

export const SelectionMark = ({ checked }: SelectionMarkProps) => (
  <span
    className={cn(
      HERO_FILTER_CHECK_CLASS.box,
      checked ? HERO_FILTER_CHECK_CLASS.checked : HERO_FILTER_CHECK_CLASS.unchecked,
    )}
    aria-hidden
  >
    {checked ? <Check className="size-3" strokeWidth={3} /> : null}
  </span>
);
