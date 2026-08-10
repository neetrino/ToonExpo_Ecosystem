import { cn } from '@/shared/ui/cn';

/** Entrance timing aligned with admin analytics / companies. */
export const LIST_CARD_STAGGER_MS = 70;
export const LIST_CONTENT_BASE_DELAY_MS = 80;
export const LIST_CARD_DURATION_MS = 520;
export const LIST_TABLE_DURATION_MS = 520;
export const LIST_PAGINATION_DELAY_MS = 280;

/**
 * Hover lift used on analytics KPI cards and list collection cards.
 * Tailwind v4 moves Y via `translate` — include it in the transition list.
 */
export const LIST_CARD_LIFT_CLASS = cn(
  'transition-[translate,box-shadow] duration-[400ms]',
  'ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
  'hover:-translate-y-1 hover:shadow-md',
  'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
);
