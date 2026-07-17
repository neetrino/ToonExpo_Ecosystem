'use client';

import { createContext, useContext, type ReactNode } from 'react';

export type DataRefreshFn = () => void | Promise<void>;

const DataRefreshContext = createContext<DataRefreshFn | null>(null);

type DataRefreshProviderProps = {
  refresh: DataRefreshFn;
  children: ReactNode;
};

/**
 * Provides a page-level refetch callback for client loaders that keep Nest data
 * in local React state. Form-success hooks call this after mutations.
 */
export function DataRefreshProvider({ refresh, children }: DataRefreshProviderProps) {
  return <DataRefreshContext.Provider value={refresh}>{children}</DataRefreshContext.Provider>;
}

/** Page-level refetch from the nearest DataRefreshProvider, or null. */
export function useDataRefresh(): DataRefreshFn | null {
  return useContext(DataRefreshContext);
}
