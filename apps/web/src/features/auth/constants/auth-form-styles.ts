/** Shared control styles for luxury auth forms. */
export const AUTH_CONTROL_CLASS =
  'h-12 rounded-md border-border/55 bg-[#faf9f6] shadow-[inset_0_1px_0_rgb(255_255_255_/_0.65)] ' +
  'transition-[border-color,box-shadow,background-color] duration-[var(--duration-base)] ' +
  'ease-[var(--ease-out-premium)] hover:border-accent/35 ' +
  'focus-visible:border-brand focus-visible:bg-surface-elevated focus-visible:ring-brand/15';

/** Phone wrapper shares the same surface language. */
export const AUTH_PHONE_CLASS =
  'h-12 rounded-md border-border/55 bg-[#faf9f6] shadow-[inset_0_1px_0_rgb(255_255_255_/_0.65)] ' +
  'hover:border-accent/35 focus-within:border-brand focus-within:ring-brand/15';

export const AUTH_LABEL_CLASS =
  'text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-label';

export const AUTH_SUBMIT_CLASS =
  'mt-2 h-12 w-full rounded-md tracking-[0.04em] shadow-md ' +
  'transition-[transform,box-shadow,background-color] duration-[var(--duration-base)] ' +
  'hover:shadow-lg';
