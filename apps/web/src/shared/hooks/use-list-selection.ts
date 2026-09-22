'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

export type ListSelectionApi = {
  selectedIds: ReadonlySet<string>;
  selectedCount: number;
  selectableIds: readonly string[];
  allSelected: boolean;
  someSelected: boolean;
  isSelected: (id: string) => boolean;
  toggle: (id: string) => void;
  toggleAll: () => void;
  clear: () => void;
};

const pruneSelection = (
  prev: ReadonlySet<string>,
  selectableIds: readonly string[],
): ReadonlySet<string> => {
  if (prev.size === 0) {
    return prev;
  }
  const allowed = new Set(selectableIds);
  const next = new Set([...prev].filter((id) => allowed.has(id)));
  return next.size === prev.size ? prev : next;
};

/**
 * Page-scoped multi-select for list tables. Selection is pruned when selectable ids change.
 */
export const useListSelection = (selectableIds: readonly string[]): ListSelectionApi => {
  const [selectedIds, setSelectedIdsState] = useState<ReadonlySet<string>>(() => new Set());
  const selectableRef = useRef(selectableIds);
  selectableRef.current = selectableIds;

  const selectedIdsPruned = useMemo(
    () => pruneSelection(selectedIds, selectableIds),
    [selectedIds, selectableIds],
  );

  const isSelected = useCallback(
    (id: string): boolean => selectedIdsPruned.has(id),
    [selectedIdsPruned],
  );

  const toggle = useCallback((id: string): void => {
    setSelectedIdsState((prev) => {
      const pruned = pruneSelection(prev, selectableRef.current);
      const next = new Set(pruned);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback((): void => {
    const ids = selectableRef.current;
    setSelectedIdsState((prev) => {
      const pruned = pruneSelection(prev, ids);
      const allOn = ids.length > 0 && ids.every((id) => pruned.has(id));
      return allOn ? new Set() : new Set(ids);
    });
  }, []);

  const clear = useCallback((): void => {
    setSelectedIdsState(new Set());
  }, []);

  const allSelected =
    selectableIds.length > 0 && selectableIds.every((id) => selectedIdsPruned.has(id));
  const someSelected = selectableIds.some((id) => selectedIdsPruned.has(id));

  return useMemo(
    () => ({
      selectedIds: selectedIdsPruned,
      selectedCount: selectedIdsPruned.size,
      selectableIds,
      allSelected,
      someSelected,
      isSelected,
      toggle,
      toggleAll,
      clear,
    }),
    [
      selectedIdsPruned,
      selectableIds,
      allSelected,
      someSelected,
      isSelected,
      toggle,
      toggleAll,
      clear,
    ],
  );
};
