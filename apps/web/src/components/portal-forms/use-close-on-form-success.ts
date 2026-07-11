'use client';

import { useRouter } from '@/i18n/navigation';
import { useEffect } from 'react';

type FormSuccessState = {
  success?: true;
};

export function useCloseOnFormSuccess(
  state: FormSuccessState,
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
