'use client';

import { useRouter } from '@/i18n/navigation';
import { useEffect } from 'react';

import type { BuilderFormActionState } from '@/lib/builder/action-state';

export function useCloseOnFormSuccess(
  state: BuilderFormActionState,
  open: boolean,
  onClose: () => void,
): void {
  const router = useRouter();

  useEffect(() => {
    if (!open || !state.success) {
      return;
    }
    onClose();
    router.refresh();
  }, [open, state.success, onClose, router]);
}
