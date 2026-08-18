'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useHomeHeroNav } from '@/features/catalog/components/home-hero-nav-context';
import {
  HOME_HERO_NAV_DESKTOP_BUTTON_CLASS,
  HOME_HERO_NAV_DESKTOP_ICON_CLASS,
  HOME_HERO_NAV_MOBILE_BUTTON_CLASS,
  HOME_HERO_NAV_MOBILE_ICON_CLASS,
  HOME_HERO_NAV_MOBILE_INSET_CLASS,
  HOME_HERO_NAV_MOBILE_TOP_CLASS,
} from '@/features/catalog/constants/home-hero';
import { cn } from '@/shared/ui/cn';
import { IconButton } from '@/shared/ui/icon-button';

type HomeHeroNavPlacement = 'hero-edges' | 'search-gaps';

type HomeHeroNavButtonsProps = {
  onPrevious: () => void;
  onNext: () => void;
  placement: HomeHeroNavPlacement;
};

const chromeClassName = cn(
  'pointer-events-auto rounded-full',
  'border-white/30 bg-brand-deep text-on-dark shadow-lg',
  'transition-[color,background-color,border-color,transform,box-shadow]',
  'hover:bg-brand-deep/90 active:scale-95',
  'focus-visible:ring-white/50 focus-visible:ring-offset-0',
  'lg:border-white/35 lg:bg-white/15 lg:shadow-md lg:backdrop-blur-[6px]',
  'lg:hover:border-white/50 lg:hover:bg-white/25',
  'motion-reduce:backdrop-blur-none motion-reduce:active:scale-100',
);

const placementClassName: Record<HomeHeroNavPlacement, string> = {
  'hero-edges': cn(
    'pointer-events-none absolute inset-0 z-[1] hidden items-center justify-between lg:flex',
    'lg:px-6 xl:px-8',
  ),
  'search-gaps': cn(
    'pointer-events-none absolute z-[1] flex -translate-y-1/2 justify-between lg:hidden',
    HOME_HERO_NAV_MOBILE_TOP_CLASS,
    HOME_HERO_NAV_MOBILE_INSET_CLASS,
  ),
};

/**
 * Manual prev/next — full-bleed on desktop; compact in the search-field gutter on small screens.
 */
export const HomeHeroNavButtons = ({
  onPrevious,
  onNext,
  placement,
}: HomeHeroNavButtonsProps) => {
  const t = useTranslations('HomePage.hero');
  const isMobileGaps = placement === 'search-gaps';
  const buttonSize = isMobileGaps ? 'sm' : 'lg';
  const buttonClassName = cn(
    chromeClassName,
    isMobileGaps ? HOME_HERO_NAV_MOBILE_BUTTON_CLASS : HOME_HERO_NAV_DESKTOP_BUTTON_CLASS,
  );
  const iconClassName = isMobileGaps
    ? HOME_HERO_NAV_MOBILE_ICON_CLASS
    : HOME_HERO_NAV_DESKTOP_ICON_CLASS;
  const previousShiftClassName = isMobileGaps ? '-translate-x-1/2' : undefined;
  const nextShiftClassName = isMobileGaps ? 'translate-x-1/2' : undefined;

  return (
    <div className={placementClassName[placement]}>
      <IconButton
        label={t('previousBanner')}
        variant="ghost"
        size={buttonSize}
        className={cn(buttonClassName, previousShiftClassName)}
        onClick={onPrevious}
      >
        <ChevronLeft className={iconClassName} aria-hidden strokeWidth={2.5} />
      </IconButton>
      <IconButton
        label={t('nextBanner')}
        variant="ghost"
        size={buttonSize}
        className={cn(buttonClassName, nextShiftClassName)}
        onClick={onNext}
      >
        <ChevronRight className={iconClassName} aria-hidden strokeWidth={2.5} />
      </IconButton>
    </div>
  );
};

/**
 * Mobile-only overlay — sits in the gap between the first two stacked search fields.
 */
export const HomeHeroSearchGapNav = () => {
  const nav = useHomeHeroNav();
  if (!nav?.canRotate) {
    return null;
  }

  return (
    <HomeHeroNavButtons
      placement="search-gaps"
      onPrevious={() => nav.goBy(-1)}
      onNext={() => nav.goBy(1)}
    />
  );
};
