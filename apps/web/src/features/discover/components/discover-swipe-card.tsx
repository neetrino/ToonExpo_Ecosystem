'use client';

import { Heart, X } from 'lucide-react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';

import { formatCatalogPrice } from '@/features/catalog/utils/format-price';
import type { DiscoverApartmentCard } from '@/features/discover/utils/load-discover-apartments';
import { cn } from '@/shared/ui/cn';

type DiscoverSwipeCardProps = {
  apartment: DiscoverApartmentCard;
  style?: CSSProperties | undefined;
  likeOpacity?: number | undefined;
  skipOpacity?: number | undefined;
  interactive?: boolean | undefined;
  onPointerDown?: ((event: ReactPointerEvent<HTMLElement>) => void) | undefined;
  onPointerMove?: ((event: ReactPointerEvent<HTMLElement>) => void) | undefined;
  onPointerUp?: ((event: ReactPointerEvent<HTMLElement>) => void) | undefined;
  onPointerCancel?: ((event: ReactPointerEvent<HTMLElement>) => void) | undefined;
};

/**
 * Full-bleed apartment card for the discover swipe deck.
 */
export const DiscoverSwipeCard = ({
  apartment,
  style,
  likeOpacity = 0,
  skipOpacity = 0,
  interactive = false,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: DiscoverSwipeCardProps) => {
  const t = useTranslations('Discover');
  const tCatalog = useTranslations('Catalog');
  const locale = useLocale();
  const priceLabel = formatCatalogPrice({
    amount: apartment.price,
    currency: apartment.priceCurrency,
    locale,
    priceVisibility: apartment.priceVisibility,
    onRequestLabel: tCatalog('price.onRequest'),
    signInLabel: tCatalog('price.signInToSee'),
  });
  const bedCount = apartment.bedrooms ?? apartment.rooms;
  const specs = [
    bedCount != null ? tCatalog('apartment.rooms', { count: bedCount }) : null,
    apartment.bathrooms != null
      ? tCatalog('apartment.bathrooms', { count: apartment.bathrooms })
      : null,
    apartment.areaTotal != null ? tCatalog('apartment.area', { area: apartment.areaTotal }) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <article
      className={cn(
        'absolute inset-0 flex flex-col overflow-hidden rounded-[28px] bg-surface-elevated',
        'border border-border select-none',
        interactive ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none',
      )}
      style={style}
      onPointerDown={interactive ? onPointerDown : undefined}
      onPointerMove={interactive ? onPointerMove : undefined}
      onPointerUp={interactive ? onPointerUp : undefined}
      onPointerCancel={interactive ? onPointerCancel : undefined}
    >
      <div className="relative min-h-0 flex-1 bg-surface">
        {apartment.image ? (
          <Image
            src={apartment.image.src}
            alt={apartment.image.alt}
            fill
            className="pointer-events-none object-cover"
            sizes="(max-width: 768px) 100vw, 28rem"
            draggable={false}
            priority={interactive}
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-brand-soft px-6 text-center font-brand text-2xl font-bold text-brand">
            {apartment.projectName}
          </div>
        )}

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent"
          aria-hidden
        />

        <div
          className={cn('pointer-events-none absolute inset-0 flex items-center justify-center')}
          style={{ opacity: likeOpacity }}
          aria-hidden
        >
          <span
            className={cn(
              'inline-flex items-center gap-3 rounded-2xl border-4 border-success px-6 py-3',
              'bg-canvas/90 text-2xl font-bold tracking-wide text-success uppercase',
              '-rotate-12',
            )}
          >
            <Heart className="size-8 fill-success" aria-hidden />
            {t('stamp.like')}
          </span>
        </div>

        <div
          className={cn('pointer-events-none absolute inset-0 flex items-center justify-center')}
          style={{ opacity: skipOpacity }}
          aria-hidden
        >
          <span
            className={cn(
              'inline-flex items-center gap-3 rounded-2xl border-4 border-danger px-6 py-3',
              'bg-canvas/90 text-2xl font-bold tracking-wide text-danger uppercase',
              'rotate-12',
            )}
          >
            <X className="size-8" strokeWidth={2.5} aria-hidden />
            {t('stamp.skip')}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5">
          <p className="text-xs font-semibold tracking-wide text-white/80 uppercase">
            {apartment.builderName}
          </p>
          <h2 className="font-brand text-2xl font-bold tracking-tight text-white">
            {t('card.unitTitle', {
              number: apartment.number,
              project: apartment.projectName,
            })}
          </h2>
          {apartment.locationLine ? (
            <p className="text-sm text-white/85">{apartment.locationLine}</p>
          ) : null}
          {specs ? <p className="text-sm text-white/85">{specs}</p> : null}
          <p className="mt-1 text-base font-semibold text-white">{priceLabel}</p>
        </div>
      </div>
    </article>
  );
};
