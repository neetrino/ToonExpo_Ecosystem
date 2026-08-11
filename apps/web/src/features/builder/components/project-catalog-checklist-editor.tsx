'use client';

import { Check, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { PROJECT_CATALOG_LIST_MAX_ITEMS } from '@/features/builder/constants/project-catalog-editor';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { cn } from '@/shared/ui/cn';

type ProjectCatalogChecklistEditorProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (() => void) | undefined;
  addLabel: string;
  removeLabel: string;
  columns?: 2 | 3 | undefined;
};

const splitItems = (value: string): string[] =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

const joinItems = (items: string[]): string =>
  items
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .join('\n');

/**
 * Editable Features / Nearby grid — checkmark + input, matches public checklist layout.
 */
export const ProjectCatalogChecklistEditor = ({
  id,
  value,
  onChange,
  onBlur,
  addLabel,
  removeLabel,
  columns = 3,
}: ProjectCatalogChecklistEditorProps) => {
  const [rows, setRows] = useState<string[]>(() => {
    const items = splitItems(value);
    return items.length > 0 ? items : [''];
  });

  useEffect(() => {
    const items = splitItems(value);
    setRows(items.length > 0 ? items : ['']);
  }, [value]);

  const commit = (nextRows: string[]): void => {
    setRows(nextRows.length > 0 ? nextRows : ['']);
    onChange(joinItems(nextRows));
  };

  const updateRow = (index: number, nextValue: string): void => {
    const nextRows = rows.map((row, rowIndex) => (rowIndex === index ? nextValue : row));
    setRows(nextRows);
    onChange(joinItems(nextRows));
  };

  const removeRow = (index: number): void => {
    commit(rows.filter((_, rowIndex) => rowIndex !== index));
  };

  const addRow = (): void => {
    if (rows.length >= PROJECT_CATALOG_LIST_MAX_ITEMS) {
      return;
    }
    setRows([...rows, '']);
  };

  return (
    <div className="flex flex-col gap-4">
      <ul
        className={cn(
          'grid grid-cols-1 gap-3',
          columns === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3',
        )}
      >
        {rows.map((row, index) => {
          const fieldId = `${id}-${index}`;
          return (
            <li key={fieldId} className="flex items-center gap-2.5">
              <Check className="size-4 shrink-0 text-brand" strokeWidth={2.5} aria-hidden />
              <Input
                id={fieldId}
                value={row}
                onChange={(event) => {
                  updateRow(index, event.target.value);
                }}
                onBlur={onBlur}
                className="h-10 flex-1 text-sm text-ink-navy"
              />
              <button
                type="button"
                className="flex size-8 shrink-0 items-center justify-center rounded-sm text-ink-muted transition-colors hover:bg-surface hover:text-danger"
                aria-label={removeLabel}
                onClick={() => {
                  removeRow(index);
                }}
              >
                <X className="size-4" strokeWidth={2} aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
      {rows.length < PROJECT_CATALOG_LIST_MAX_ITEMS ? (
        <Button type="button" variant="soft" size="sm" className="self-start" onClick={addRow}>
          <Plus className="size-4" strokeWidth={2} aria-hidden />
          {addLabel}
        </Button>
      ) : null}
    </div>
  );
};
