'use client';

import type { InteractiveMappingFloorSummary } from '@toonexpo/contracts';
import { ChevronRight, Layers, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { cn } from '@/shared/ui/cn';
import { LIST_CARD_LIFT_CLASS } from '@/shared/ui/motion';
import { SearchField } from '@/shared/ui/search-field';

import { isFloorPlanMappingUnlocked } from '../utils/is-floor-plan-mapping-unlocked';
import { matchesMappingSearch } from '../utils/matches-mapping-search';

const FLOOR_INDEX_PAD = 2;

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

const formatFloorIndex = (index: number): string =>
  String(index + 1).padStart(FLOOR_INDEX_PAD, '0');

/**
 * Floor cards for plan upload — same chrome as district / building pickers.
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
  const tPicker = useTranslations('Admin.interactiveMapping.forms.floorPicker');
  const [query, setQuery] = useState('');

  const sorted = useMemo(() => [...floors].sort((a, b) => a.number - b.number), [floors]);
  const filtered = useMemo(
    () =>
      sorted.filter((floor) => matchesMappingSearch(query, floorLabel(floor), floor.number)),
    [query, sorted],
  );

  return (
    <section className="w-full min-w-0 rounded-lg border border-border bg-surface-elevated p-4 shadow-xs sm:p-5">
      <header className="mb-4 flex items-center gap-2">
        <Layers className="size-4 text-brand" aria-hidden />
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
      </header>

      {floors.length > 0 ? (
        <SearchField
          className="mb-4 w-full"
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
        <ul className="w-full min-w-0 space-y-3">
          {filtered.map((floor, index) => {
            const unlocked = isFloorPlanMappingUnlocked(floor);
            const selected = floor.id === selectedFloorId;
            const label = floorLabel(floor);
            const statusLabel = !unlocked
              ? needsPolygonLabel
              : floor.hasFloorPlan || floor.floorplanMediaId
                ? planReadyLabel
                : '—';

            return (
              <li key={floor.id} className="w-full min-w-0">
                <button
                  type="button"
                  aria-disabled={!unlocked}
                  title={!unlocked ? lockedHint : undefined}
                  className={cn(
                    'grid w-full min-w-0 grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center overflow-hidden rounded-lg border border-border bg-surface-elevated text-left transition-colors sm:grid-cols-[5rem_minmax(0,1fr)_auto]',
                    LIST_CARD_LIFT_CLASS,
                    unlocked ? 'hover:border-border-strong' : 'opacity-70',
                    selected && 'border-border-strong ring-1 ring-border-strong',
                  )}
                  onClick={() => {
                    if (!unlocked) {
                      onSelectLockedFloor(floor);
                      return;
                    }
                    onSelectFloor(floor.id);
                  }}
                >
                  <div className="flex h-full flex-col items-center justify-center bg-brand-soft px-2 py-4">
                    <span className="font-display text-3xl leading-none text-brand">
                      {formatFloorIndex(index)}
                    </span>
                    <span className="mt-1 text-[11px] font-medium text-brand">
                      {tPicker('floorIndex')}
                    </span>
                  </div>

                  <div className="min-w-0 px-4 py-3">
                    <p className="flex min-w-0 items-center gap-2 text-sm font-semibold tracking-tight text-ink">
                      {!unlocked ? (
                        <Lock className="size-3.5 shrink-0 text-ink-muted" aria-hidden />
                      ) : null}
                      <span className="truncate">{label}</span>
                    </p>
                    <p className="mt-1 truncate text-xs text-ink-muted">{statusLabel}</p>
                  </div>

                  <span
                    className={cn(
                      'mr-4 inline-flex size-10 shrink-0 items-center justify-center rounded-full text-on-dark sm:mr-5',
                      unlocked ? 'bg-brand' : 'bg-ink-muted',
                    )}
                    aria-hidden
                  >
                    <ChevronRight className="size-5" strokeWidth={2.25} />
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
