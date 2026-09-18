"use client";

import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

export const LIST_SEARCH_DEBOUNCE_MS = 300;

/**
 * Debounces list search for API queries. Clearing the field applies immediately.
 */
export const useDebouncedSearch = (search: string): string => {
  const trimmed = search.trim();
  const debounced = useDebouncedValue(trimmed, LIST_SEARCH_DEBOUNCE_MS);
  return trimmed.length === 0 ? "" : debounced;
};
