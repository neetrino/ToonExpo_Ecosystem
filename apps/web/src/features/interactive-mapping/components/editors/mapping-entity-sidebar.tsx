'use client';

import { Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/cn';
import { IconButton } from '@/shared/ui/icon-button';

import type { MappingEntity } from '../mapping-canvas/mapping-canvas';

const NON_DIGIT = /\D/g;
const CONTROL_RADIUS_CLASS = 'rounded-[15px]';

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
  /** Restrict Label to ASCII digits (apartments). */
  labelDigitsOnly?: boolean | undefined;
  deleteLabel?: string | undefined;
  onSelect: (id: string) => void;
  onLabelChange: (id: string, label: string) => void;
  onSave: () => void;
  onClear: () => void;
  onDelete?: ((id: string) => void) | undefined;
};

type MappingEntityListItemProps = {
  entity: MappingEditorEntity;
  selected: boolean;
  dirty: boolean;
  pending: boolean;
  deleteLabel: string;
  onSelect: (id: string) => void;
  onDelete?: ((id: string) => void) | undefined;
};

const MappingEntityListItem = ({
  entity,
  selected,
  dirty,
  pending,
  deleteLabel,
  onSelect,
  onDelete,
}: MappingEntityListItemProps) => (
  <li className="flex items-stretch">
    <button
      type="button"
      className={cn(
        'flex min-w-0 flex-1 items-center justify-between border-l-2 border-transparent px-3 py-2 text-left text-sm text-ink',
        selected && 'border-ink',
      )}
      onClick={() => onSelect(entity.id)}
    >
      <span className="truncate">
        {entity.label} · {entity.title}
        {dirty ? ' · *' : ''}
      </span>
      <span className="text-[10px] text-ink-muted">
        {entity.svgPath ? 'poly' : entity.markerX != null ? 'pin' : '—'}
      </span>
    </button>
    {onDelete ? (
      <IconButton
        label={deleteLabel}
        size="sm"
        variant="ghost"
        className="my-auto mr-1 size-8 shrink-0 text-ink-muted hover:bg-danger/10 hover:text-danger"
        disabled={pending}
        onClick={() => {
          onDelete(entity.id);
        }}
      >
        <Trash2 className="size-3.5" strokeWidth={1.75} aria-hidden />
      </IconButton>
    ) : null}
  </li>
);

type MappingEntitySelectedPanelProps = {
  selected: MappingEditorEntity;
  pending: boolean;
  message: string | null;
  labelDigitsOnly: boolean;
  onLabelChange: (id: string, label: string) => void;
  onSave: () => void;
  onClear: () => void;
};

const MappingEntitySelectedPanel = ({
  selected,
  pending,
  message,
  labelDigitsOnly,
  onLabelChange,
  onSave,
  onClear,
}: MappingEntitySelectedPanelProps) => (
  <div
    className={cn(
      CONTROL_RADIUS_CLASS,
      'space-y-2 border border-border bg-background p-3 text-sm',
    )}
  >
    <label className="block text-ink-muted">
      Label
      <input
        className={cn(
          CONTROL_RADIUS_CLASS,
          'mt-1 w-full border border-border bg-background px-2 py-1 text-ink',
        )}
        value={selected.label}
        maxLength={32}
        inputMode={labelDigitsOnly ? 'numeric' : 'text'}
        pattern={labelDigitsOnly ? '[0-9]*' : undefined}
        onChange={(event) => {
          const next = event.target.value;
          onLabelChange(selected.id, labelDigitsOnly ? next.replace(NON_DIGIT, '') : next);
        }}
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
);

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
  labelDigitsOnly = false,
  deleteLabel = 'Delete',
  onSelect,
  onLabelChange,
  onSave,
  onClear,
  onDelete,
}: MappingEntitySidebarProps) => {
  const selected = entities.find((item) => item.id === selectedId) ?? null;

  return (
    <aside className="space-y-3">
      <h2 className="font-display text-xl text-ink">{listTitle}</h2>
      {entities.length === 0 ? (
        <p
          className={cn(
            CONTROL_RADIUS_CLASS,
            'border border-border bg-surface px-3 py-2 text-sm text-ink-muted',
          )}
        >
          {emptyHint ?? 'No items yet. Create one first, then draw a polygon.'}
        </p>
      ) : (
        <ul
          className={cn(
            CONTROL_RADIUS_CLASS,
            'divide-y divide-border overflow-hidden border border-border bg-background',
          )}
        >
          {entities.map((entity) => (
            <MappingEntityListItem
              key={entity.id}
              entity={entity}
              selected={entity.id === selectedId}
              dirty={dirtyIds.has(entity.id)}
              pending={pending}
              deleteLabel={deleteLabel}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}

      {selected ? (
        <MappingEntitySelectedPanel
          selected={selected}
          pending={pending}
          message={message}
          labelDigitsOnly={labelDigitsOnly}
          onLabelChange={onLabelChange}
          onSave={onSave}
          onClear={onClear}
        />
      ) : null}

      {footer}
    </aside>
  );
};
