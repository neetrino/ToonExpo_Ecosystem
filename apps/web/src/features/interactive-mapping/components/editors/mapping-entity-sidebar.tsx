'use client';

import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState, type ReactNode } from 'react';

import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/cn';
import { IconButton } from '@/shared/ui/icon-button';
import { SearchField } from '@/shared/ui/search-field';

import { matchesMappingSearch } from '../../utils/matches-mapping-search';
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
  searchPlaceholder?: string | undefined;
  footer?: ReactNode | undefined;
  /** Restrict Label to ASCII digits (apartments). */
  labelDigitsOnly?: boolean | undefined;
  deleteLabel?: string | undefined;
  deleteAllPolygonsLabel?: string | undefined;
  onSelect: (id: string) => void;
  onLabelChange: (id: string, label: string) => void;
  onSave: () => void;
  onClear: () => void;
  onDelete?: ((id: string) => void) | undefined;
  onClearAllPolygons?: (() => void) | undefined;
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
  clearLabel: string;
  saveLabel: string;
  labelFieldLabel: string;
  onLabelChange: (id: string, label: string) => void;
  onSave: () => void;
  onClear: () => void;
};

const MappingEntitySelectedPanel = ({
  selected,
  pending,
  message,
  labelDigitsOnly,
  clearLabel,
  saveLabel,
  labelFieldLabel,
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
      {labelFieldLabel}
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
      {pending ? '…' : saveLabel}
    </Button>
    {selected.hotspotId || selected.markerX != null || selected.svgPath ? (
      <Button
        type="button"
        size="sm"
        variant="danger"
        className="w-full"
        disabled={pending}
        onClick={onClear}
      >
        {clearLabel}
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
  searchPlaceholder,
  footer,
  labelDigitsOnly = false,
  deleteLabel = 'Delete',
  deleteAllPolygonsLabel,
  onSelect,
  onLabelChange,
  onSave,
  onClear,
  onDelete,
  onClearAllPolygons,
}: MappingEntitySidebarProps) => {
  const t = useTranslations('Admin.interactiveMapping.forms');
  const tCanvas = useTranslations('Admin.interactiveMapping.canvas');
  const [query, setQuery] = useState('');
  const selected = entities.find((item) => item.id === selectedId) ?? null;
  const polygonCount = entities.filter((entity) => entity.svgPath).length;
  const resolvedSearchPlaceholder = searchPlaceholder ?? t('searchEntities');

  const filtered = useMemo(
    () => entities.filter((entity) => matchesMappingSearch(query, entity.label, entity.title)),
    [entities, query],
  );

  return (
    <aside className="space-y-3">
      <h2 className="font-display text-xl text-ink">{listTitle}</h2>
      {entities.length > 0 ? (
        <SearchField
          value={query}
          placeholder={resolvedSearchPlaceholder}
          aria-label={resolvedSearchPlaceholder}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
        />
      ) : null}
      {entities.length === 0 ? (
        <p
          className={cn(
            CONTROL_RADIUS_CLASS,
            'border border-border bg-surface px-3 py-2 text-sm text-ink-muted',
          )}
        >
          {emptyHint ?? 'No items yet. Create one first, then draw a polygon.'}
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-ink-muted">{t('searchNoResults', { query })}</p>
      ) : (
        <ul
          className={cn(
            CONTROL_RADIUS_CLASS,
            'divide-y divide-border overflow-hidden border border-border bg-background',
          )}
        >
          {filtered.map((entity) => (
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

      {polygonCount > 0 && onClearAllPolygons && deleteAllPolygonsLabel ? (
        <Button
          type="button"
          size="sm"
          variant="danger"
          className="w-full"
          disabled={pending}
          onClick={onClearAllPolygons}
        >
          {deleteAllPolygonsLabel}
        </Button>
      ) : null}

      {selected ? (
        <MappingEntitySelectedPanel
          selected={selected}
          pending={pending}
          message={message}
          labelDigitsOnly={labelDigitsOnly}
          clearLabel={tCanvas('clearMapping')}
          saveLabel={tCanvas('save')}
          labelFieldLabel={tCanvas('labelField')}
          onLabelChange={onLabelChange}
          onSave={onSave}
          onClear={onClear}
        />
      ) : null}

      {footer}
    </aside>
  );
};
