'use client';

import Image from 'next/image';
import type { MouseEvent } from 'react';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

const BRAND_LOGO_PILL_SRC = '/brand/toon-expo-logo.png';
const BRAND_LOGO_PILL_WIDTH = 366;
const BRAND_LOGO_PILL_HEIGHT = 364;

const BRAND_LOGO_OVER_HERO_SRC = '/brand/toon-expo-logo-over-hero.png';
const BRAND_LOGO_OVER_HERO_WIDTH = 464;
const BRAND_LOGO_OVER_HERO_HEIGHT = 454;

const BRAND_LOGO_ALT = 'TOON EXPO — Real Estate and Construction Expo 2025';

type BrandLogoProps = {
  href?: '/' | '/builder' | '/admin' | '/partner' | '/settings' | '/dashboard' | undefined;
  className?: string | undefined;
  badge?: string | undefined;
  /**
   * When true (navbar without pill / over hero), use the over-hero lockup.
   * When false (pill / solid chrome), use the white-background lockup.
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
  sm: 'h-[46px] w-[46px]',
  md: 'h-[70px] w-[70px]',
  lg: 'h-[78px] w-[78px]',
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
  const width = overHero ? BRAND_LOGO_OVER_HERO_WIDTH : BRAND_LOGO_PILL_WIDTH;
  const height = overHero ? BRAND_LOGO_OVER_HERO_HEIGHT : BRAND_LOGO_PILL_HEIGHT;

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
        width={width}
        height={height}
        className={cn(
          'object-contain',
          // Keep the white plate on the pill lockup only.
          !overHero && 'bg-white',
          imageClassName[size],
        )}
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
