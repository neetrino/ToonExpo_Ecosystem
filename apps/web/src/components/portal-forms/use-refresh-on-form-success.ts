'use client';

import { useEffect } from 'react';

import { useDataRefresh } from '@/components/portal-forms/data-refresh-context';
import { useRouter } from '@/i18n/navigation';

type FormSuccessState = {
  success?: true;
};

/**
 * Refreshes client (and optionally RSC) data after a successful form action
 * without closing overlays. Prefer DataRefreshProvider over `router.refresh()` alone.
 */
export function useRefreshOnFormSuccess(
  state: FormSuccessState,
  enabled: boolean,
  onSuccess?: () => void | Promise<void>,
): void {
  const router = useRouter();
  const contextRefresh = useDataRefresh();

  useEffect(() => {
    if (!enabled || !state.success) {
      return;
    }
    const refresh = onSuccess ?? contextRefresh;
    void refresh?.();
    router.refresh();
  }, [enabled, state.success, onSuccess, contextRefresh, router]);
}
