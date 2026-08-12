'use client';

import { useCallback, useState, type ReactNode } from 'react';

import { EphemeralToast } from '@/shared/ui/ephemeral-toast';

type ToastState = {
  id: number;
  message: string;
};

/**
 * Success confirmation toast after a save/update (top-center, auto-dismiss).
 */
export const useSuccessToast = (): {
  showSuccess: (message: string) => void;
  successToast: ReactNode;
} => {
  const [toast, setToast] = useState<ToastState | null>(null);

  const dismiss = useCallback(() => {
    setToast(null);
  }, []);

  const showSuccess = useCallback((message: string) => {
    setToast({ id: Date.now(), message });
  }, []);

  return {
    showSuccess,
    successToast: (
      <EphemeralToast
        id={toast?.id}
        message={toast?.message ?? null}
        onDismiss={dismiss}
        tone="success"
      />
    ),
  };
};
