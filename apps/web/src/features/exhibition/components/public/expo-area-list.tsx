'use client';

import type { PublicVenueMapArea } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { resolveVenueMapAreaTitle } from '@/features/exhibition/utils/resolve-venue-map-area-title';
import { Card } from '@/shared/ui/card';
import { cn } from '@/shared/ui/cn';

type ExpoAreaListProps = {
  areas: PublicVenueMapArea[];
  highlightedAreaId: string | null;
  onSelect: (areaId: string) => void;
};

/**
 * List fallback for the public venue map on small screens.
 */
export const ExpoAreaList = ({ areas, highlightedAreaId, onSelect }: ExpoAreaListProps) => {
  const t = useTranslations('Expo.list');

  return (
    <Card className="p-0">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">{t('title')}</h2>
      </div>
      <ul className="flex flex-col divide-y divide-border">
        {areas.map((area) => (
          <li key={area.id}>
            <button
              type="button"
              className={cn(
                'flex w-full flex-col gap-0.5 px-4 py-3 text-left text-sm hover:bg-surface',
                highlightedAreaId === area.id && 'bg-surface',
              )}
              onClick={() => onSelect(area.id)}
            >
              <span className="font-medium text-ink">{resolveVenueMapAreaTitle(area)}</span>
              <span className="text-xs text-ink-secondary">{area.code}</span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
};
