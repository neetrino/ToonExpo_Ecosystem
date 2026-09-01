'use client';

import Image from 'next/image';
import type { MouseEvent } from 'react';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

/** Shared lockup frame — color (pill) and white (over-hero) match 1:1. */
const BRAND_LOGO_WIDTH = 464;
const BRAND_LOGO_HEIGHT = 454;

/** Color lockup when the navbar pill / solid chrome is visible. */
const BRAND_LOGO_PILL_SRC = '/brand/toon-expo-logo-pill.png';

/** White lockup over the home hero (transparent navbar). */
const BRAND_LOGO_OVER_HERO_SRC = '/brand/toon-expo-logo-over-hero.png';

const BRAND_LOGO_ALT = 'TOON EXPO — Real Estate and Construction Expo 2025';

type BrandLogoProps = {
  href?: '/' | '/builder' | '/admin' | '/partner' | '/settings' | '/dashboard' | undefined;
  className?: string | undefined;
  badge?: string | undefined;
  /**
   * When true (navbar without pill / over hero), use the over-hero lockup.
   * When false (pill / solid chrome), use the color pill lockup.
   */
  inverted?: boolean | undefined;
  size?: 'sm' | 'md' | 'lg' | undefined;
  /** Kept for call-site compatibility — full lockup always includes the mark. */
  showMark?: boolean | undefined;
  /** Fired when logo scrolls to top while already on home. */
  onHomeClick?: (() => void) | undefined;
};

/** Full official lockup — sized to stay readable in chrome, not cropped. */
const imageClassName = {
  sm: 'h-[40px] w-[40px]',
  md: 'h-[58px] w-[58px]',
  lg: 'h-[68px] w-[68px]',
} as const;

/**
 * Official TOON EXPO lockup for public header / portal chrome.
 * On the home page, clicking the logo scrolls smoothly to the top.
 */
export const BrandLogo = ({
  href = '/',
  className,
  badge,
  inverted = false,
  size = 'md',
  onHomeClick,
}: BrandLogoProps) => {
  const pathname = usePathname();
  const overHero = inverted;
  const src = overHero ? BRAND_LOGO_OVER_HERO_SRC : BRAND_LOGO_PILL_SRC;

  const onClick = (event: MouseEvent<HTMLAnchorElement>): void => {
    if (href !== '/') {
      return;
    }
    if (pathname !== '/' && pathname !== '') {
      return;
    }
    event.preventDefault();
    onHomeClick?.();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'inline-flex gap-2',
        badge ? 'items-start' : 'items-center',
        className,
      )}
    >
      <Image
        src={src}
        alt={BRAND_LOGO_ALT}
        width={BRAND_LOGO_WIDTH}
        height={BRAND_LOGO_HEIGHT}
        className={cn('object-contain', imageClassName[size])}
        priority
      />
      {badge ? (
        <span
          className={cn(
            'pt-1 text-[10px] font-semibold uppercase tracking-[0.14em]',
            overHero ? 'text-on-dark/70' : 'text-ink-muted',
          )}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
};
