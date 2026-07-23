'use client';

import Image from 'next/image';

import { cn } from '@/shared/ui/cn';

/** Square logo slot on admin list cards (size-12). */
export const ADMIN_LIST_CARD_LOGO_PX = 48;

type AdminListCardLogoProps = {
  name: string;
  logoUrl: string | null;
  className?: string | undefined;
};

/**
 * Left-aligned logo for admin collection cards, with initials fallback.
 */
export const AdminListCardLogo = ({ name, logoUrl, className }: AdminListCardLogoProps) => {
  const initials = name.trim().slice(0, 2).toUpperCase() || '—';

  return (
    <div
      className={cn(
        'relative size-12 shrink-0 overflow-hidden rounded-sm bg-surface ring-1 ring-border',
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
