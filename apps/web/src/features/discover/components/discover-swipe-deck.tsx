'use client';

import { Heart, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { useMeQuery } from '@/features/auth/hooks/use-auth';
import { useToggleFavoriteMutation } from '@/features/buyer/hooks/use-favorites';
import { isBuyerAccount } from '@/features/buyer/utils/is-buyer-account';
import { DiscoverSwipeCard } from '@/features/discover/components/discover-swipe-card';
import { DISCOVER_SWIPE_EXIT_MS, DISCOVER_SWIPE_EXIT_PX } from '@/features/discover/constants';
import {
  buildDiscoverFlyoutStyle,
  type DiscoverSwipeCommitPayload,
  type DiscoverSwipeDirection,
  useDiscoverSwipeCard,
} from '@/features/discover/hooks/use-discover-swipe-card';
import type { DiscoverApartmentCard } from '@/features/discover/utils/load-discover-apartments';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';

type DiscoverSwipeDeckProps = {
  apartments: DiscoverApartmentCard[];
};

type FlyoutCard = {
  apartment: DiscoverApartmentCard;
  direction: DiscoverSwipeDirection;
  fromX: number;
  exiting: boolean;
};

/**
 * Tinder-style apartment deck: right = like (favorite), left = skip.
 * Next card stays put underneath; leaving card flies out as a separate layer.
 */
export const DiscoverSwipeDeck = ({ apartments }: DiscoverSwipeDeckProps) => {
  const t = useTranslations('Discover');
  const { data: me } = useMeQuery();
  const isBuyer = isBuyerAccount(me);
  const favoriteMutation = useToggleFavoriteMutation();
  const [index, setIndex] = useState(0);
  const [flyout, setFlyout] = useState<FlyoutCard | null>(null);

  const current = apartments[index] ?? null;
  const next = apartments[index + 1] ?? null;
  const isDone = index >= apartments.length && flyout == null;

  const handleCommit = useCallback(
    ({ direction, fromX }: DiscoverSwipeCommitPayload) => {
      const apartment = apartments[index];
      if (!apartment) {
        return;
      }

      if (direction === 'right' && isBuyer) {
        favoriteMutation.mutate({
          targetType: 'apartment',
          targetId: apartment.id,
          favorited: false,
        });
      }

      setFlyout({ apartment, direction, fromX, exiting: false });
      setIndex((value) => value + 1);
    },
    [apartments, favoriteMutation, index, isBuyer],
  );

  const actionsEnabled = current != null && !isDone && flyout == null;

  const {
    cardStyle,
    likeOpacity,
    skipOpacity,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    triggerExit,
  } = useDiscoverSwipeCard({
    enabled: actionsEnabled,
    onCommit: handleCommit,
  });

  useEffect(() => {
    if (!flyout) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setFlyout((previous) =>
        previous && !previous.exiting ? { ...previous, exiting: true } : previous,
      );
    });

    const timerId = window.setTimeout(() => {
      setFlyout(null);
    }, DISCOVER_SWIPE_EXIT_MS);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timerId);
    };
  }, [flyout?.apartment.id]);

  if (isDone) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Heart className="size-7" aria-hidden />
        </span>
        <h2 className="font-brand text-2xl font-bold text-ink">{t('empty.title')}</h2>
        <p className="max-w-xs text-sm text-ink-secondary">{t('empty.body')}</p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setIndex(0);
            setFlyout(null);
          }}
        >
          {t('empty.restart')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-3">
      <div className="relative min-h-0 w-full flex-1">
        {next ? <DiscoverSwipeCard key={next.id} apartment={next} /> : null}

        {current ? (
          <DiscoverSwipeCard
            key={current.id}
            apartment={current}
            interactive
            style={cardStyle}
            likeOpacity={likeOpacity}
            skipOpacity={skipOpacity}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
          />
        ) : null}

        {flyout ? (
          <DiscoverSwipeCard
            key={flyout.apartment.id}
            apartment={flyout.apartment}
            style={buildDiscoverFlyoutStyle(
              flyout.fromX,
              flyout.direction,
              flyout.exiting,
              DISCOVER_SWIPE_EXIT_PX,
            )}
          />
        ) : null}
      </div>

      <div className="flex shrink-0 items-center justify-center gap-8 pb-1">
        <IconButton
          label={t('actions.skip')}
          variant="outline"
          size="lg"
          disabled={!actionsEnabled}
          className="size-14 rounded-full border-danger/40 text-danger hover:border-danger hover:bg-danger/10"
          onClick={() => triggerExit('left')}
        >
          <X className="size-7" strokeWidth={2.5} aria-hidden />
        </IconButton>

        <IconButton
          label={t('actions.like')}
          variant="outline"
          size="lg"
          disabled={!actionsEnabled}
          className="size-14 rounded-full border-success/40 text-success hover:border-success hover:bg-success/10"
          onClick={() => triggerExit('right')}
        >
          <Heart className="size-7 fill-current" strokeWidth={2.5} aria-hidden />
        </IconButton>
      </div>
    </div>
  );
};
