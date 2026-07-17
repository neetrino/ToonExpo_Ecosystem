'use client';

import { useEffect } from 'react';

import { useDataRefresh } from '@/components/portal-forms/data-refresh-context';
import { useRouter } from '@/i18n/navigation';

type FormSuccessState = {
  success?: true;
};

/**
 * Closes an overlay after a successful form action and refreshes client data.
 * Prefer `onSuccess` / DataRefreshProvider over relying on `router.refresh()` alone.
 */
export function useCloseOnFormSuccess(
  state: FormSuccessState,
  open: boolean,
  onClose: () => void,
  onSuccess?: () => void | Promise<void>,
): void {
  const router = useRouter();
  const contextRefresh = useDataRefresh();

  useEffect(() => {
    if (!open || !state.success) {
      return;
    }
    onClose();
    const refresh = onSuccess ?? contextRefresh;
    void refresh?.();
    router.refresh();
  }, [open, state.success, onClose, onSuccess, contextRefresh, router]);
}
