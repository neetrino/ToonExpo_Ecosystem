'use client';

import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type ListCardHitLinkProps = {
  href: string;
  label: string;
};

/** Stretched link so the whole collection card is clickable. */
export const LIST_CARD_HIT_LINK_CLASS =
  'absolute inset-0 z-[1] block rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30';

/** Keep nested buttons above the stretched link. */
export const LIST_CARD_FOREGROUND_CLASS = 'relative z-[2]';

/**
 * Full-card hit target for admin/builder collection cards.
 */
export const ListCardHitLink = ({ href, label }: ListCardHitLinkProps) => (
  <Link href={href} aria-label={label} className={cn(LIST_CARD_HIT_LINK_CLASS)} />
);
