import type { ReactNode } from 'react';

const TE_BADGE_BASE =
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide';

const TE_BADGE_TONES = {
  verified: 'bg-[var(--te-accent-soft)] text-[var(--te-accent)]',
  new: 'bg-[var(--te-fg)] text-white',
  status: 'bg-[var(--te-bg-soft)] text-[var(--te-fg)]',
  muted: 'bg-[var(--te-bg-soft)] text-[var(--te-muted)]',
} as const;

export type TeBadgeTone = keyof typeof TE_BADGE_TONES;

export type TeBadgeProps = {
  tone?: TeBadgeTone;
  children: ReactNode;
  className?: string;
};

export function TeBadge({ tone = 'status', children, className }: TeBadgeProps) {
  const classes = [TE_BADGE_BASE, TE_BADGE_TONES[tone], className].filter(Boolean).join(' ');
  return <span className={classes}>{children}</span>;
}
