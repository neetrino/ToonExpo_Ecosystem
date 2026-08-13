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
  'border-white/35 bg-white/15 text-on-dark shadow-md backdrop-blur-[6px]',
  'hover:border-white/50 hover:bg-white/25',
  'focus-visible:ring-white/40 focus-visible:ring-offset-0',
);

/**
 * Manual prev/next for the home hero carousel — glass chips on the photo edges.
 */
export const HomeHeroNavButtons = ({ onPrevious, onNext }: HomeHeroNavButtonsProps) => {
  const t = useTranslations('HomePage.hero');

  return (
    <div className="pointer-events-none absolute inset-0 z-[1]">
      <IconButton
        label={t('previousBanner')}
        variant="ghost"
        size="lg"
        className={cn(
          navButtonClassName,
          'absolute top-1/2 start-3 -translate-y-1/2 sm:start-6 lg:start-8',
        )}
        onClick={onPrevious}
      >
        <ChevronLeft className="size-5" aria-hidden strokeWidth={2.25} />
      </IconButton>
      <IconButton
        label={t('nextBanner')}
        variant="ghost"
        size="lg"
        className={cn(
          navButtonClassName,
          'absolute top-1/2 end-3 -translate-y-1/2 sm:end-6 lg:end-8',
        )}
        onClick={onNext}
      >
        <ChevronRight className="size-5" aria-hidden strokeWidth={2.25} />
      </IconButton>
    </div>
  );
};
