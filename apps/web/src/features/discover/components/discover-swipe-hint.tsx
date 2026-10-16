'use client';

import { Heart, X } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'toonexpo.discover.swipe-hint-seen';

const hasSeenHint = (): boolean => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return true;
  }
};

const markHintSeen = (): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // Private mode: skip persisting; the hint can return next visit.
  }
};

type DiscoverSwipeHintProps = {
  onDismiss?: () => void;
};

/**
 * Swipe coach on the card. Shown once, until the visitor closes it.
 */
export const DiscoverSwipeHint = ({ onDismiss }: DiscoverSwipeHintProps) => {
  const t = useTranslations('Discover.hintCoach');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(!hasSeenHint());
  }, []);

  if (!open) {
    return null;
  }

  const dismiss = (): void => {
    markHintSeen();
    setOpen(false);
    onDismiss?.();
  };

  return (
    <div className="absolute inset-0 z-20 rounded-[28px]">
      <button
        type="button"
        aria-label={t('dismiss')}
        className="absolute inset-0 rounded-[28px] bg-ink-navy/55"
        onClick={dismiss}
      />
      <button
        type="button"
        aria-label={t('dismiss')}
        className="absolute top-3 right-3 z-10 inline-flex size-9 items-center justify-center rounded-full bg-white text-ink-navy shadow-sm"
        onClick={dismiss}
      >
        <X className="size-4" aria-hidden />
      </button>
      <HintBadge side="left" label={t('skip')} icon="skip" />
      <HintBadge side="right" label={t('like')} icon="like" />
      <SwipeHand />
    </div>
  );
};

const HintBadge = ({
  side,
  label,
  icon,
}: {
  side: 'left' | 'right';
  label: string;
  icon: 'skip' | 'like';
}) => (
  <div
    className={
      side === 'left'
        ? 'pointer-events-none absolute top-[18%] left-4 flex flex-col items-center gap-2'
        : 'pointer-events-none absolute top-[14%] right-4 flex flex-col items-center gap-2'
    }
  >
    <span
      className={
        icon === 'skip'
          ? 'discover-hint-skip-glow inline-flex size-16 items-center justify-center rounded-full bg-[#ff5a4e] text-white'
          : 'discover-hint-like-glow inline-flex size-16 items-center justify-center rounded-full bg-[#3dbe9a] text-white'
      }
    >
      {icon === 'skip' ? (
        <X className="size-8" strokeWidth={2.5} aria-hidden />
      ) : (
        <Heart className="size-8 fill-current" aria-hidden />
      )}
    </span>
    <span
      className={
        icon === 'skip'
          ? 'whitespace-nowrap rounded-full bg-[#ff5a4e] px-3 py-1 text-xs font-bold text-white'
          : 'whitespace-nowrap rounded-full bg-[#d7f6ec] px-3 py-1 text-xs font-bold text-[#14856a]'
      }
    >
      {label}
    </span>
  </div>
);

const SwipeHand = () => (
  <div className="pointer-events-none absolute bottom-[6%] left-1/2 w-40 -translate-x-1/2">
    <Image
      src="/brand/discover-swipe-hand.png"
      alt=""
      width={160}
      height={160}
      className="discover-swipe-hint-hand h-40 w-40 object-contain mix-blend-screen"
    />
  </div>
);
