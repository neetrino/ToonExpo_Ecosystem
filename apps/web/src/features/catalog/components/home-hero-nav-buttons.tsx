'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/shared/ui/cn';
import { IconButton } from '@/shared/ui/icon-button';

type HomeHeroNavButtonsProps = {
  onPrevious: () => void;
  onNext: () => void;
};

const navButtonClassName = cn(
  'pointer-events-auto size-11 rounded-full',
  'border-white/30 bg-brand-deep text-on-dark shadow-lg',
  'transition-[color,background-color,border-color,transform,box-shadow]',
  'hover:bg-brand-deep/90 active:scale-95',
  'focus-visible:ring-white/50 focus-visible:ring-offset-0',
  'lg:border-white/35 lg:bg-white/15 lg:shadow-md lg:backdrop-blur-[6px]',
  'lg:hover:border-white/50 lg:hover:bg-white/25',
  'motion-reduce:backdrop-blur-none motion-reduce:active:scale-100',
);

/**
 * Manual prev/next — same left/right edge placement as desktop; solid on small screens so they read on the search card.
 */
export const HomeHeroNavButtons = ({ onPrevious, onNext }: HomeHeroNavButtonsProps) => {
  const t = useTranslations('HomePage.hero');

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 z-[1] flex items-center justify-between',
        'px-2 sm:px-4 lg:px-6 xl:px-8',
      )}
    >
      <IconButton
        label={t('previousBanner')}
        variant="ghost"
        size="lg"
        className={navButtonClassName}
        onClick={onPrevious}
      >
        <ChevronLeft className="size-5" aria-hidden strokeWidth={2.5} />
      </IconButton>
      <IconButton
        label={t('nextBanner')}
        variant="ghost"
        size="lg"
        className={navButtonClassName}
        onClick={onNext}
      >
        <ChevronRight className="size-5" aria-hidden strokeWidth={2.5} />
      </IconButton>
    </div>
  );
};
