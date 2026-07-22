'use client';

import type { FavoriteApartmentCard } from '@toonexpo/contracts';
import { Heart } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { AccountStatusBadge } from '@/features/buyer/components/account/account-status-badge';
import { formatCatalogPrice } from '@/features/catalog/utils/format-price';
import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';

type FavoriteApartmentCardProps = {
  apartment: FavoriteApartmentCard;
  onRemove: () => void;
  removing?: boolean | undefined;
};

const salesStatusTone = (
  status: FavoriteApartmentCard['salesStatus'],
): 'success' | 'warning' | 'neutral' => {
  if (status === 'available') {
    return 'success';
  }
  if (status === 'reserved') {
    return 'warning';
  }
  return 'neutral';
};

/**
 * Compact apartment card for the buyer favorites grid.
 */
export const FavoriteApartmentCardView = ({
  apartment,
  onRemove,
  removing = false,
}: FavoriteApartmentCardProps) => {
  const t = useTranslations('Favorites');
  const tCatalog = useTranslations('Catalog');
  const locale = useLocale();
  const price = formatCatalogPrice({
    amount: apartment.price,
    currency: apartment.priceCurrency,
    locale,
    priceVisibility: apartment.priceVisibility,
    onRequestLabel: tCatalog('price.onRequest'),
    signInLabel: tCatalog('price.signInToSee'),
  });

  return (
    <Card variant="elevated" padding="sm" className="flex h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex flex-col gap-1">
          <Link
            href={`/apartments/${apartment.id}`}
            className="text-sm font-semibold text-ink transition-colors hover:text-brand"
          >
            {t('apartmentTitle', {
              number: apartment.number,
              project: apartment.project.name,
            })}
          </Link>
          <p className="text-xs text-ink-secondary">{apartment.builder.name}</p>
        </div>
        <AccountStatusBadge
          label={tCatalog(`status.${apartment.salesStatus}`)}
          tone={salesStatusTone(apartment.salesStatus)}
        />
      </div>

      <dl className="grid grid-cols-2 gap-3 text-xs text-ink-secondary sm:grid-cols-3">
        {apartment.rooms != null ? (
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              {tCatalog('apartment.roomsLabel')}
            </dt>
            <dd className="mt-0.5 font-medium text-ink">{apartment.rooms}</dd>
          </div>
        ) : null}
        {apartment.areaTotal != null ? (
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              {tCatalog('apartment.areaLabel')}
            </dt>
            <dd className="mt-0.5 font-medium text-ink">
              {tCatalog('apartment.area', { area: apartment.areaTotal })}
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
            {t('priceLabel')}
          </dt>
          <dd className="mt-0.5 font-medium text-ink">{price}</dd>
        </div>
      </dl>

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
        <Link
          href={`/projects/${apartment.project.id}`}
          className="text-xs font-semibold text-brand hover:underline"
        >
          {tCatalog('actions.viewProject')}
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ml-auto h-8 px-2 text-xs text-danger hover:text-danger"
          disabled={removing}
          onClick={onRemove}
        >
          <Heart className="size-3.5 fill-current" aria-hidden />
          {t('removeButton')}
        </Button>
      </div>
    </Card>
  );
};
