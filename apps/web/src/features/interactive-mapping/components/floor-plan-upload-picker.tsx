'use client';

import type { InteractiveMappingFloorSummary } from '@toonexpo/contracts';
import { Lock } from 'lucide-react';

import { cn } from '@/shared/ui/cn';

import { isFloorPlanMappingUnlocked } from '../utils/is-floor-plan-mapping-unlocked';

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
  const sorted = [...floors].sort((a, b) => a.number - b.number);

  return (
    <div className="space-y-2 rounded-sm border border-border bg-background p-3">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {sorted.length === 0 ? (
        <p className="text-sm text-ink-muted">{emptyLabel}</p>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {sorted.map((floor) => {
            const unlocked = isFloorPlanMappingUnlocked(floor);
            const selected = floor.id === selectedFloorId;
            const label = floor.name ?? `Floor ${floor.number}`;

            return (
              <li key={floor.id}>
                <button
                  type="button"
                  aria-disabled={!unlocked}
                  title={!unlocked ? lockedHint : undefined}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors',
                    !unlocked
                      ? 'cursor-not-allowed bg-surface/60 text-ink-muted'
                      : 'text-ink hover:bg-surface',
                    selected && unlocked && 'bg-surface',
                    selected && !unlocked && 'bg-surface/80',
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
                    <span className="truncate">{label}</span>
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
    </div>
  );
};
