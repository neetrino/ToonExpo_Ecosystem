import { cn } from '@/shared/ui/cn';

/**
 * Logo (`size-14` / `size-16`) + `gap-5` — same end inset as the start of the title column.
 */
export const CATALOG_HERO_CARD_COPY_END_INSET_CLASS = 'pr-[4.75rem] sm:pr-[5.25rem]';

export const CATALOG_HERO_CARD_DESCRIPTION_CLASS = 'mt-3 text-lg leading-6 text-header-muted';

export const CATALOG_HERO_CARD_DESCRIPTION_DESKTOP_CLASS = cn(
  CATALOG_HERO_CARD_DESCRIPTION_CLASS,
  CATALOG_HERO_CARD_COPY_END_INSET_CLASS,
);
