'use client';

import type { ReactNode } from 'react';

import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/cn';

import type { MappingEntity } from '../mapping-canvas/mapping-canvas';

export type MappingEditorEntity = MappingEntity & {
  hotspotId: string | null;
};

export type MappingEntitySidebarProps = {
  listTitle: string;
  entities: MappingEditorEntity[];
  selectedId: string | null;
  dirtyIds: Set<string>;
  pending: boolean;
  message: string | null;
  emptyHint?: string | undefined;
  footer?: ReactNode | undefined;
  onSelect: (id: string) => void;
  onLabelChange: (id: string, label: string) => void;
  onSave: () => void;
  onClear: () => void;
};

/**
 * Entity list + save controls beside MappingCanvas.
 */
export const MappingEntitySidebar = ({
  listTitle,
  entities,
  selectedId,
  dirtyIds,
  pending,
  message,
  emptyHint,
  footer,
  onSelect,
  onLabelChange,
  onSave,
  onClear,
}: MappingEntitySidebarProps) => {
  const selected = entities.find((item) => item.id === selectedId) ?? null;

  return (
    <aside className="space-y-3">
      <h2 className="font-display text-xl text-ink">{listTitle}</h2>
      {entities.length === 0 ? (
        <p className="rounded-sm border border-border bg-surface px-3 py-2 text-sm text-ink-muted">
          {emptyHint ?? 'No items yet. Create one first, then draw a polygon.'}
        </p>
      ) : (
        <ul className="divide-y divide-border border border-border bg-background">
          {entities.map((entity) => (
            <li key={entity.id}>
              <button
                type="button"
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2 text-left text-sm text-ink',
                  entity.id === selectedId && 'bg-surface',
                )}
                onClick={() => onSelect(entity.id)}
              >
                <span>
                  {entity.label} · {entity.title}
                  {dirtyIds.has(entity.id) ? ' · *' : ''}
                </span>
                <span className="text-[10px] text-ink-muted">
                  {entity.svgPath ? 'poly' : entity.markerX != null ? 'pin' : '—'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected ? (
        <div className="space-y-2 rounded-sm border border-border bg-background p-3 text-sm">
          <label className="block text-ink-muted">
            Label
            <input
              className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1 text-ink"
              value={selected.label}
              maxLength={32}
              onChange={(event) => onLabelChange(selected.id, event.target.value)}
            />
          </label>
          <Button type="button" size="sm" className="w-full" disabled={pending} onClick={onSave}>
            {pending ? '…' : 'Save'}
          </Button>
          {selected.hotspotId ? (
            <Button
              type="button"
              size="sm"
              variant="danger"
              className="w-full"
              disabled={pending}
              onClick={onClear}
            >
              Clear mapping
            </Button>
          ) : null}
          {message ? <p className="text-xs text-ink-muted">{message}</p> : null}
        </div>
      ) : null}

      {footer}
    </aside>
  );
};
