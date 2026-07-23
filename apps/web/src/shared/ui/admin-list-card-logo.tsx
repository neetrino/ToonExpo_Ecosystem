'use client';

import Image from 'next/image';

import { cn } from '@/shared/ui/cn';

/** Default fixed logo slot (list rows). */
export const ADMIN_LIST_CARD_LOGO_PX = 48;

/** Max expected logo edge when matching text column height (cards). */
const ADMIN_LIST_CARD_LOGO_MATCH_PX = 160;

type AdminListCardLogoShape = 'square' | 'circle';
type AdminListCardLogoSize = 'md' | 'match';

type AdminListCardLogoProps = {
  name: string;
  logoUrl: string | null;
  shape?: AdminListCardLogoShape | undefined;
  /** `match` — square equal to the full text column height (cards). */
  size?: AdminListCardLogoSize | undefined;
  className?: string | undefined;
};

/**
 * Logo for admin collection cards/rows.
 * Card mode: `size="match"` is a square as tall as the text block.
 */
export const AdminListCardLogo = ({
  name,
  logoUrl,
  shape = 'square',
  size = 'md',
  className,
}: AdminListCardLogoProps) => {
  const initials = name.trim().slice(0, 2).toUpperCase() || '—';
  const isMatch = size === 'match';
  const imageSizes = `${isMatch ? ADMIN_LIST_CARD_LOGO_MATCH_PX : ADMIN_LIST_CARD_LOGO_PX}px`;

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden bg-surface ring-1 ring-border',
        shape === 'circle' ? 'rounded-full' : 'rounded-sm',
        isMatch ? 'self-stretch' : 'size-12',
        className,
      )}
    >
      {isMatch ? <svg viewBox="0 0 1 1" className="block h-full w-auto" aria-hidden /> : null}
      {logoUrl ? (
        <Image src={logoUrl} alt="" fill className="object-cover" sizes={imageSizes} />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-ink-muted">
          {initials}
        </span>
      )}
    </div>
  );
};
