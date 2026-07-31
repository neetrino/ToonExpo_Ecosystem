'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { BuyApartmentCard } from '@/features/catalog/components/buy-apartment-card';
import { BuyApartmentsMap } from '@/features/catalog/components/buy-apartments-map';
import type { BuyApartmentListing } from '@/features/catalog/utils/load-buy-apartments';
import {
  collectMappableProjectIds,
  resolveMapObjectForProject,
} from '@/features/catalog/utils/resolve-map-object-for-project';
import type { GeoMapFocusRequest } from '@/features/geo-map/types';
import { mapPublicGeoMapItemsToObjects } from '@/features/geo-map/utils/map-object-mapper';
import { usePublicGeoMapModelsQuery } from '@/features/geo-map/public/hooks/use-public-geo-map-models';
import { Link, usePathname } from '@/i18n/navigation';
import { EmptyState } from '@/shared/ui/empty-state';

type BuyApartmentsBrowseProps = {
  listings: BuyApartmentListing[];
};

/**
 * Map + listing grid body for the Buy apartments page.
 * List → map only: "Show on map" focuses the apartment's project model.
 */
export const BuyApartmentsBrowse = ({ listings }: BuyApartmentsBrowseProps) => {
  const t = useTranslations('BuyPage');
  const pathname = usePathname();
  const modelsQuery = usePublicGeoMapModelsQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusRequest, setFocusRequest] = useState<GeoMapFocusRequest | undefined>(undefined);
  const [highlightedObjectId, setHighlightedObjectId] = useState<string | null>(null);
  const loginHref = `/auth/login?returnUrl=${encodeURIComponent(pathname)}`;

  const objects = useMemo(
    () => mapPublicGeoMapItemsToObjects(modelsQuery.data?.data ?? []),
    [modelsQuery.data?.data],
  );
  const mappableProjectIds = useMemo(() => collectMappableProjectIds(objects), [objects]);

  const onShowOnMap = (listing: BuyApartmentListing): void => {
    setSelectedId(listing.id);
    const object = resolveMapObjectForProject(objects, listing.projectId);
    if (!object) {
      return;
    }
    setHighlightedObjectId(object.id);
    setFocusRequest((prev) => ({
      objectId: object.id,
      token: (prev?.token ?? 0) + 1,
    }));
  };

  return (
    <div className="grid grid-cols-1 bg-canvas lg:grid-cols-2">
      <BuyApartmentsMap
        focusRequest={focusRequest}
        highlightedObjectId={highlightedObjectId}
        homesInViewCount={listings.length}
      />

      <div className="bg-canvas px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h1 className="font-brand text-[clamp(1.35rem,2.5vw,1.4rem)] font-bold tracking-[-0.02em] text-ink-navy">
            {t('title')}
          </h1>
          <p className="text-sm text-header-muted">{t('results', { count: listings.length })}</p>
        </div>

        {listings.length === 0 ? (
          <EmptyState title={t('empty')} />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {listings.map((listing) => (
              <BuyApartmentCard
                key={listing.id}
                listing={listing}
                highlighted={selectedId != null && listing.id === selectedId}
                canShowOnMap={mappableProjectIds.has(listing.projectId)}
                onShowOnMap={() => onShowOnMap(listing)}
              />
            ))}
          </div>
        )}

        <div className="mt-10 rounded-[20px] border border-dashed border-header-border px-6 py-8 text-center">
          <p className="text-sm text-header-muted">{t('saveSearchHint')}</p>
          <Link
            href={loginHref}
            className="mt-4 inline-flex h-9 items-center rounded-xl bg-brand-deep px-5 text-sm font-semibold text-on-dark"
          >
            {t('saveSearch')}
          </Link>
        </div>
      </div>
    </div>
  );
};
