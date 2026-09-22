'use client';

import type { PublicationStatus } from '@toonexpo/contracts';
import { useMemo } from 'react';

import type { BulkDeleteTarget } from '@/features/admin/hooks/use-inventory-bulk-delete';
import { useListSelection } from '@/shared/hooks/use-list-selection';
import type { ListTableSelectionProps } from '@/shared/ui/list-selection.types';
import { VIEW_MODE_LIST, type ViewMode } from '@/shared/ui/view-mode';

type SelectableInventoryItem = {
  id: string;
  publicationStatus: PublicationStatus;
  builderCompanyId?: string | undefined;
};

type UseInventoryListSelectionOptions = {
  /** When false, selection UI is disabled (e.g. cards view or no permission). */
  enabled: boolean;
};

type InventoryListSelectionResult = {
  listSelection: ListTableSelectionProps | undefined;
  selectedTargets: BulkDeleteTarget[];
  selectionClear: () => void;
  selectedCount: number;
};

/**
 * Selection state for inventory list tables (list view + permission gated).
 * All publication statuses are selectable and deletable.
 */
export const useInventoryListSelection = <T extends SelectableInventoryItem>(
  items: readonly T[],
  viewMode: ViewMode,
  options: UseInventoryListSelectionOptions,
): InventoryListSelectionResult => {
  const enabled = options.enabled && viewMode === VIEW_MODE_LIST;

  const selectableIds = useMemo(
    () => (enabled ? items.map((item) => item.id) : []),
    [enabled, items],
  );

  const selection = useListSelection(selectableIds);
  const selectableIdSet = useMemo(() => new Set(selectableIds), [selectableIds]);

  const selectedTargets = useMemo(
    (): BulkDeleteTarget[] =>
      items
        .filter((item) => selection.selectedIds.has(item.id))
        .map((item) => ({
          id: item.id,
          ...(item.builderCompanyId ? { companyId: item.builderCompanyId } : {}),
        })),
    [items, selection.selectedIds],
  );

  return {
    listSelection: enabled ? { selection, selectableIdSet } : undefined,
    selectedTargets,
    selectionClear: selection.clear,
    selectedCount: selection.selectedCount,
  };
};
