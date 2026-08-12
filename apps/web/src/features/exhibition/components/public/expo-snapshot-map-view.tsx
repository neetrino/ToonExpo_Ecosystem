'use client';

import type { PublicVenueMapArea, PublicVenueMapSnapshotResponse } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { resolveVenueMapAreaTitle } from '@/features/exhibition/utils/resolve-venue-map-area-title';
import { cn } from '@/shared/ui/cn';

const VENUE_MAP_LABEL_SIZE_RATIO = 0.014;
const VENUE_MAP_LABEL_MIN_PX = 14;

type ExpoSnapshotMapViewProps = {
  snapshot: PublicVenueMapSnapshotResponse;
  highlightedAreaId: string | null;
  onSelectArea: (areaId: string) => void;
};

/**
 * Read-only public venue map: background image plus BOS area cell fills.
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
      <div className="rounded-sm border border-dashed border-border px-4 py-8 text-center text-sm text-ink-secondary">
        {t('noImage')}
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-sm border border-border">
      <svg
        viewBox={`0 0 ${snapshot.mapWidth} ${snapshot.mapHeight}`}
        className="h-auto w-full"
        role="img"
        aria-label={t('alt')}
      >
        <image
          href={snapshot.backgroundUrl}
          width={snapshot.mapWidth}
          height={snapshot.mapHeight}
        />
        {snapshot.areas.map((area) => (
          <AreaGroup
            key={area.id}
            area={area}
            highlighted={highlightedAreaId === area.id}
            fontSize={fontSize}
            onSelect={onSelectArea}
          />
        ))}
      </svg>
    </div>
  );
};

type AreaGroupProps = {
  area: PublicVenueMapArea;
  highlighted: boolean;
  fontSize: number;
  onSelect: (areaId: string) => void;
};

const AreaGroup = ({ area, highlighted, fontSize, onSelect }: AreaGroupProps) => {
  const title = resolveVenueMapAreaTitle(area);
  const isHidden = area.displayMode === 'hidden';

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={title}
      className="cursor-pointer outline-none"
      onClick={() => onSelect(area.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(area.id);
        }
      }}
    >
      {area.rects.map((rect, index) => (
        <rect
          key={`${area.id}-${index}`}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          className={cn(
            isHidden
              ? 'fill-ink/10 stroke-ink/25'
              : 'fill-brand/25 stroke-brand/80',
            highlighted && !isHidden && 'fill-brand/45 stroke-brand',
            highlighted && isHidden && 'fill-ink/20 stroke-ink/50',
          )}
          strokeWidth={highlighted ? 3 : 2}
        />
      ))}
      {isHidden ? null : (
        <text
          x={area.labelX}
          y={area.labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="pointer-events-none fill-ink font-semibold"
          fontSize={fontSize}
        >
          {title}
        </text>
      )}
    </g>
  );
};
