'use client';

import { Check } from 'lucide-react';

import { HERO_FILTER_CHECK_CLASS } from '@/features/catalog/components/hero-filter-menu-styles';
import { cn } from '@/shared/ui/cn';

type SelectionMarkProps = {
  checked: boolean;
  shape?: 'square' | 'circle' | undefined;
};

export const SelectionMark = ({ checked, shape = 'square' }: SelectionMarkProps) => (
  <span
    className={cn(
      HERO_FILTER_CHECK_CLASS.box,
      shape === 'circle' && 'rounded-full',
      checked ? HERO_FILTER_CHECK_CLASS.checked : HERO_FILTER_CHECK_CLASS.unchecked,
    )}
    aria-hidden
  >
    {checked ? <Check className="size-3" strokeWidth={3} /> : null}
  </span>
);
