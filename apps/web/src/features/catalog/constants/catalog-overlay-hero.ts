import { cn } from '@/shared/ui/cn';

/**
 * Overlay hero copy stays on the left so it does not run across the banner photo.
 * Full width on small screens; half width from `md` up.
 */
export const CATALOG_OVERLAY_HERO_COPY_WIDTH_CLASS = 'w-full min-w-0 md:max-w-[50%]';

/** Left-weighted scrim — readable type without darkening the photo subject. */
export const CATALOG_OVERLAY_HERO_SCRIM_CLASS =
  'absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/40 to-transparent';

export const CATALOG_OVERLAY_HERO_TITLE_CLASS = cn(
  'font-brand font-bold text-on-dark',
  'text-[clamp(1.625rem,1.05rem+2.2vw,2.75rem)]',
  'leading-[1.1] tracking-[-0.025em]',
  'break-words text-balance',
);

export const CATALOG_OVERLAY_HERO_BODY_CLASS = cn(
  'text-on-dark/95',
  'text-[clamp(0.875rem,0.8rem+0.3vw,1.0625rem)]',
  'leading-[1.5]',
  'text-pretty',
);
