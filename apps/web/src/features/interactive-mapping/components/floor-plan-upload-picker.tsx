'use client';

import type { InteractiveMappingFloorSummary } from '@toonexpo/contracts';
import { Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { cn } from '@/shared/ui/cn';
import { SearchField } from '@/shared/ui/search-field';

import { isFloorPlanMappingUnlocked } from '../utils/is-floor-plan-mapping-unlocked';
import { matchesMappingSearch } from '../utils/matches-mapping-search';

export type FloorPlanUploadPickerProps = {
  floors: InteractiveMappingFloorSummary[];
  selectedFloorId: string | null;
  title: string;
  emptyLabel: string;
  lockedHint: string;
  planReadyLabel: string;
  needsPolygonLabel: string;
  onSelectFloor: (floorId: string) => void;
  onSelectLockedFloor: (floor: InteractiveMappingFloorSummary) => void;
};

const floorLabel = (floor: InteractiveMappingFloorSummary): string =>
  floor.name ?? `Floor ${floor.number}`;

/**
 * Lists floors for plan upload. Floors without a building-render polygon stay locked
 * unless a floor plan is already uploaded.
 */
export const FloorPlanUploadPicker = ({
  floors,
  selectedFloorId,
  title,
  emptyLabel,
  lockedHint,
  planReadyLabel,
  needsPolygonLabel,
  onSelectFloor,
  onSelectLockedFloor,
}: FloorPlanUploadPickerProps) => {
  const t = useTranslations('Admin.interactiveMapping.forms');
  const [query, setQuery] = useState('');

  const sorted = useMemo(() => [...floors].sort((a, b) => a.number - b.number), [floors]);
  const filtered = useMemo(
    () =>
      sorted.filter((floor) => matchesMappingSearch(query, floorLabel(floor), floor.number)),
    [query, sorted],
  );

  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-xs sm:p-5">
      <h3 className="mb-3 text-sm font-semibold text-ink">{title}</h3>
      {floors.length > 0 ? (
        <SearchField
          className="mb-3"
          value={query}
          placeholder={t('searchFloors')}
          aria-label={t('searchFloors')}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
        />
      ) : null}
      {floors.length === 0 ? (
        <p className="text-sm text-ink-muted">{emptyLabel}</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-ink-muted">{t('searchNoResults', { query })}</p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-md border border-border">
          {filtered.map((floor) => {
            const unlocked = isFloorPlanMappingUnlocked(floor);
            const selected = floor.id === selectedFloorId;
            const label = floorLabel(floor);

            return (
              <li key={floor.id}>
                <button
                  type="button"
                  aria-disabled={!unlocked}
                  title={!unlocked ? lockedHint : undefined}
                  className={cn(
                    'flex w-full items-center justify-between gap-4 border-l-[3px] px-4 py-3.5 text-left text-sm transition-colors',
                    !unlocked
                      ? 'cursor-not-allowed border-transparent bg-surface/60 text-ink-muted'
                      : selected
                        ? 'border-ink bg-surface-elevated text-ink'
                        : 'border-transparent bg-surface text-ink hover:bg-surface-elevated/70',
                  )}
                  onClick={() => {
                    if (!unlocked) {
                      onSelectLockedFloor(floor);
                      return;
                    }
                    onSelectFloor(floor.id);
                  }}
                >
                  <span className="inline-flex min-w-0 items-center gap-2">
                    {!unlocked ? (
                      <Lock className="size-3.5 shrink-0 text-ink-muted" aria-hidden />
                    ) : null}
                    <span className="truncate font-medium">{label}</span>
                  </span>
                  <span className="shrink-0 text-xs text-ink-muted">
                    {!unlocked
                      ? needsPolygonLabel
                      : floor.hasFloorPlan || floor.floorplanMediaId
                        ? planReadyLabel
                        : '—'}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
