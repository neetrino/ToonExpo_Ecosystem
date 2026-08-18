/**
 * Shared surface styles for hero search filter dropdowns (Location / Price / Beds).
 * Navy + white — matches Search homes CTA and header chrome.
 */
export const HERO_FILTER_PANEL_CLASS =
  'w-full overflow-hidden rounded-[16px] border border-header-border bg-white ' +
  'shadow-[0_18px_40px_rgb(9_43_68/0.14)]';

export const HERO_FILTER_OPTION_BASE_CLASS =
  'flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm ' +
  'transition-colors duration-[var(--duration-base)]';

export const heroFilterOptionStateClass = (active: boolean): string =>
  active
    ? 'bg-brand-soft font-semibold text-ink-navy'
    : 'font-medium text-ink-navy/75 hover:bg-brand-deep/[0.04]';

export const HERO_FILTER_CHECK_CLASS = {
  box: 'inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] border',
  checked: 'border-brand-deep bg-brand-deep text-on-dark',
  unchecked: 'border-header-border bg-white',
} as const;

export const HERO_FILTER_SEARCH_INPUT_CLASS =
  'h-10 w-full rounded-[10px] border border-header-border bg-canvas pl-9 pr-3 ' +
  'text-base text-ink-navy outline-none placeholder:text-header-muted lg:text-sm ' +
  'focus-visible:border-brand-deep focus-visible:ring-2 focus-visible:ring-brand-deep/15';
