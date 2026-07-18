"use client";

import type { ReactNode } from "react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";

import { QUERY_DEFAULT_STALE_TIME_MS } from "@/shared/config/constants";

type QueryProviderProps = {
  children: ReactNode;
};

const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_DEFAULT_STALE_TIME_MS,
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });

/**
 * Client-side TanStack Query provider for auth and future server state.
 */
export const QueryProvider = ({ children }: QueryProviderProps) => {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
