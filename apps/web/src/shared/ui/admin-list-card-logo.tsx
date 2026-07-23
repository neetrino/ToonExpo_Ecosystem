'use client';

import Image from 'next/image';

import { cn } from '@/shared/ui/cn';

/** Default fixed logo slot (list rows). */
export const ADMIN_LIST_CARD_LOGO_PX = 48;

type AdminListCardLogoShape = 'square' | 'circle';
type AdminListCardLogoSize = 'md' | 'match';

type AdminListCardLogoProps = {
  name: string;
  logoUrl: string | null;
  shape?: AdminListCardLogoShape | undefined;
  /** `match` stretches to the full text column height (cards). */
  size?: AdminListCardLogoSize | undefined;
  className?: string | undefined;
};

/**
 * Logo for admin collection cards/rows.
 * Card mode: `size="match"` spans the full text block height.
 */
export const AdminListCardLogo = ({
  name,
  logoUrl,
  shape = 'square',
  size = 'md',
  className,
}: AdminListCardLogoProps) => {
  const initials = name.trim().slice(0, 2).toUpperCase() || '—';

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden bg-surface ring-1 ring-border',
        shape === 'circle' ? 'rounded-full' : 'rounded-sm',
        size === 'match' ? 'aspect-square h-auto min-h-12 w-auto self-stretch' : 'size-12',
        className,
      )}
    >
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt=""
          fill
          className="object-cover"
          sizes={`${ADMIN_LIST_CARD_LOGO_PX}px`}
        />
      ) : (
        <span className="flex size-full items-center justify-center text-xs font-semibold text-ink-muted">
          {initials}
        </span>
      )}
    </div>
  );
};
