'use client';

import { cn } from '@/shared/ui/cn';

type BurgerMenuIconProps = {
  open: boolean;
  className?: string | undefined;
};

/** Icon box matches lucide `size-5`. */
const ICON_SIZE_CLASS = 'size-5';
/** Line thickness. */
const LINE_HEIGHT_CLASS = 'h-[2px]';
/** Line width inside the 20px box. */
const LINE_WIDTH_CLASS = 'w-[18px]';

/**
 * Hamburger ↔ X morph — one icon, smooth transform (no icon swap flash).
 */
export const BurgerMenuIcon = ({ open, className }: BurgerMenuIconProps) => {
  return (
    <span
      className={cn('relative inline-flex items-center justify-center', ICON_SIZE_CLASS, className)}
      aria-hidden
    >
      <span
        className={cn(
          'absolute left-1/2 block -translate-x-1/2 rounded-full bg-current',
          LINE_HEIGHT_CLASS,
          LINE_WIDTH_CLASS,
          'transition-transform duration-[var(--burger-icon-ms,320ms)] ease-[var(--ease-out-premium)]',
          'motion-reduce:transition-none',
          open ? 'translate-y-0 rotate-45' : '-translate-y-[5px] rotate-0',
        )}
      />
      <span
        className={cn(
          'absolute left-1/2 block -translate-x-1/2 rounded-full bg-current',
          LINE_HEIGHT_CLASS,
          LINE_WIDTH_CLASS,
          'transition-[opacity,transform] duration-[var(--burger-icon-ms,320ms)] ease-[var(--ease-out-premium)]',
          'motion-reduce:transition-none',
          open ? 'scale-x-0 opacity-0' : 'scale-x-100 opacity-100',
        )}
      />
      <span
        className={cn(
          'absolute left-1/2 block -translate-x-1/2 rounded-full bg-current',
          LINE_HEIGHT_CLASS,
          LINE_WIDTH_CLASS,
          'transition-transform duration-[var(--burger-icon-ms,320ms)] ease-[var(--ease-out-premium)]',
          'motion-reduce:transition-none',
          open ? 'translate-y-0 -rotate-45' : 'translate-y-[5px] rotate-0',
        )}
      />
    </span>
  );
};
