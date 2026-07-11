'use client';

import { useRouter } from '@/i18n/navigation';
import { useEffect } from 'react';

type FormSuccessState = {
  success?: true;
};

/** Refreshes server data after a successful form action without closing overlays. */
export function useRefreshOnFormSuccess(state: FormSuccessState, enabled: boolean): void {
  const router = useRouter();

  useEffect(() => {
    if (!enabled || !state.success) {
      return;
    }
    router.refresh();
  }, [enabled, state.success, router]);
}
