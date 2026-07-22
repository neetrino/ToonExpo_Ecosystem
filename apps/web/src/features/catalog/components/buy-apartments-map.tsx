'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';

import type { BuyApartmentListing } from '@/features/catalog/utils/load-buy-apartments';
import { formatCatalogPrice } from '@/features/catalog/utils/format-price';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

const BUY_MAP_SRC = '/images/buy-map.jpg';

type BuyApartmentsMapProps = {
  listings: BuyApartmentListing[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

/**
 * Map panel with price pins — Figma `103:1437` left column.
 */
export const BuyApartmentsMap = ({ listings, selectedId, onSelect }: BuyApartmentsMapProps) => {
  const t = useTranslations('BuyPage');
  const locale = useLocale();
  const pins = listings.slice(0, 8);

  return (
    <div className="relative h-[min(70vh,52rem)] overflow-hidden bg-canvas lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]">
      <Image
        src={BUY_MAP_SRC}
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 50vw"
        priority
      />
      <div className="absolute inset-0 bg-canvas/10" aria-hidden />

      {pins.map((listing, index) => {
        const priceLabel = formatCatalogPrice({
          amount: listing.price,
          currency: listing.priceCurrency,
          locale,
          priceVisibility: listing.priceVisibility,
          onRequestLabel: '—',
          signInLabel: '—',
        });
        const position = pinPosition(index, pins.length);
        const selected = listing.id === selectedId;

        return (
          <Link
            key={listing.id}
            href={`/apartments/${listing.id}`}
            onMouseEnter={() => onSelect(listing.id)}
            className={cn(
              'absolute z-[1] -translate-x-1/2 -translate-y-1/2 rounded-pill px-3 py-1',
              'font-brand text-xs font-bold whitespace-nowrap shadow-md',
              'transition-transform hover:z-[2] hover:scale-105',
              selected ? 'bg-brand-deep text-on-dark' : 'bg-canvas text-brand-deep',
            )}
            style={{ left: position.left, top: position.top }}
          >
            {priceLabel}
          </Link>
        );
      })}

      <div className="absolute bottom-4 left-4 z-[1] inline-flex items-center gap-2 rounded-xl bg-canvas/95 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-ink-navy">
        <span className="size-2 shrink-0 rounded-pill bg-[#00a159]" aria-hidden />
        {t('homesInView', { count: listings.length })}
      </div>
    </div>
  );
};

const pinPosition = (index: number, total: number): { left: string; top: string } => {
  const col = index % 3;
  const row = Math.floor(index / 3);
  const left = 24 + col * 26;
  const top = 26 + row * 22 + (total > 6 ? 0 : 2);
  return {
    left: `${Math.min(left, 76)}%`,
    top: `${Math.min(top, 70)}%`,
  };
};
