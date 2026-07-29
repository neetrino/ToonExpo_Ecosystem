'use client';

import type { InteractiveMappingFloorSummary } from '@toonexpo/contracts';

import { cn } from '@/shared/ui/cn';

export type FloorPlanUploadPickerProps = {
  floors: InteractiveMappingFloorSummary[];
  selectedFloorId: string | null;
  title: string;
  emptyLabel: string;
  onSelectFloor: (floorId: string) => void;
};

/**
 * Lists floors so admin can pick one for plan upload / apartment mapping.
 */
export const FloorPlanUploadPicker = ({
  floors,
  selectedFloorId,
  title,
  emptyLabel,
  onSelectFloor,
}: FloorPlanUploadPickerProps) => {
  const sorted = [...floors].sort((a, b) => a.number - b.number);

  return (
    <div className="space-y-2 rounded-sm border border-border bg-background p-3">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {sorted.length === 0 ? (
        <p className="text-sm text-ink-muted">{emptyLabel}</p>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {sorted.map((floor) => (
            <li key={floor.id}>
              <button
                type="button"
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2 text-left text-sm text-ink',
                  floor.id === selectedFloorId && 'bg-surface',
                )}
                onClick={() => onSelectFloor(floor.id)}
              >
                <span>{floor.name ?? `Floor ${floor.number}`}</span>
                <span className="text-xs text-ink-muted">
                  {floor.floorplanMediaId ? 'plan' : '—'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
