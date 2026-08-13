'use client';

import type { PublicVenueMapSnapshotResponse } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { VenueMapAreaGroup } from '@/features/exhibition/components/public/venue-map-area-group';

const VENUE_MAP_LABEL_SIZE_RATIO = 0.016;
const VENUE_MAP_LABEL_MIN_PX = 16;

type ExpoSnapshotMapViewProps = {
  snapshot: PublicVenueMapSnapshotResponse;
  highlightedAreaId: string | null;
  onSelectArea: (areaId: string) => void;
};

/**
 * Read-only public venue map at intrinsic picture size.
 */
export const ExpoSnapshotMapView = ({
  snapshot,
  highlightedAreaId,
  onSelectArea,
}: ExpoSnapshotMapViewProps) => {
  const t = useTranslations('Expo.map');
  const fontSize = Math.max(
    VENUE_MAP_LABEL_MIN_PX,
    snapshot.mapWidth * VENUE_MAP_LABEL_SIZE_RATIO,
  );

  if (!snapshot.backgroundUrl) {
    return (
      <div className="rounded-[20px] border border-dashed border-header-border bg-surface-elevated px-4 py-8 text-center text-sm text-header-muted">
        {t('noImage')}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[20px] border border-header-border bg-surface-elevated">
      <svg
        viewBox={`0 0 ${snapshot.mapWidth} ${snapshot.mapHeight}`}
        className="block h-auto w-full bg-surface-elevated"
        role="img"
        aria-label={t('alt')}
      >
        <image
          href={snapshot.backgroundUrl}
          width={snapshot.mapWidth}
          height={snapshot.mapHeight}
        />
        {snapshot.areas.map((area, index) => (
          <VenueMapAreaGroup
            key={area.id}
            area={area}
            colorIndex={area.sortOrder ?? index}
            highlighted={highlightedAreaId === area.id}
            fontSize={fontSize}
            onSelect={onSelectArea}
          />
        ))}
      </svg>
    </div>
  );
};
