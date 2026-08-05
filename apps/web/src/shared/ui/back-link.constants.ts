/**
 * Shared BackLink visual tokens aligned with Button / IconButton.
 */

export type BackLinkVariant = 'standard' | 'compact' | 'icon';
export type BackLinkTone = 'default' | 'onDark' | 'subtle';

export const BACK_LINK_BASE_CLASS = [
  'group inline-flex w-fit shrink-0 items-center justify-center self-start',
  'rounded-[15px] border font-medium tracking-tight',
  'shadow-xs transition-[color,background-color,border-color,box-shadow,transform,opacity]',
  'duration-[var(--duration-fast)] ease-[var(--ease-out-premium)]',
  'motion-reduce:transition-none',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  'active:scale-[0.98] motion-reduce:active:scale-100',
  'disabled:pointer-events-none disabled:opacity-50',
].join(' ');

export const BACK_LINK_VARIANT_CLASS: Record<BackLinkVariant, string> = {
  standard: 'h-9 gap-2 px-3 text-sm',
  compact: 'h-8 gap-1.5 px-2.5 text-xs',
  icon: 'size-10 gap-0 p-0',
};

export const BACK_LINK_TONE_CLASS: Record<BackLinkTone, string> = {
  default: [
    'border-border/80 bg-surface-elevated/90 text-ink',
    'hover:border-border-strong hover:bg-surface hover:shadow-sm',
    'focus-visible:ring-brand/30',
  ].join(' '),
  onDark: [
    'border-white/25 bg-white/10 text-on-dark shadow-none',
    'hover:border-white/40 hover:bg-white/18 hover:shadow-none',
    'focus-visible:ring-white/40 focus-visible:ring-offset-ink',
  ].join(' '),
  subtle: [
    'border-transparent bg-transparent text-ink-secondary shadow-none',
    'hover:border-border/60 hover:bg-surface hover:text-ink hover:shadow-xs',
    'focus-visible:ring-brand/25',
  ].join(' '),
};

export const BACK_LINK_ICON_CLASS =
  'shrink-0 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-premium)] motion-reduce:transition-none group-hover:-translate-x-0.5 motion-reduce:group-hover:translate-x-0';

export const BACK_LINK_ICON_SIZE: Record<BackLinkVariant, string> = {
  standard: 'size-4',
  compact: 'size-3.5',
  icon: 'size-5',
};
