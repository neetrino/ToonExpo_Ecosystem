'use client';

import { useCallback, useState, type ReactNode } from 'react';

import { EphemeralToast } from '@/shared/ui/ephemeral-toast';

const ERROR_TOAST_HOLD_MS = 4200;

type ToastState = {
  id: number;
  message: string;
};

/**
 * Red validation/API error toast (top-center, auto-dismiss).
 */
export const useErrorToast = (): {
  showError: (message: string) => void;
  errorToast: ReactNode;
} => {
  const [toast, setToast] = useState<ToastState | null>(null);

  const dismiss = useCallback(() => {
    setToast(null);
  }, []);

  const showError = useCallback((message: string) => {
    setToast({ id: Date.now(), message });
  }, []);

  return {
    showError,
    errorToast: (
      <EphemeralToast
        holdMs={ERROR_TOAST_HOLD_MS}
        id={toast?.id}
        message={toast?.message ?? null}
        onDismiss={dismiss}
        tone="danger"
      />
    ),
  };
};
