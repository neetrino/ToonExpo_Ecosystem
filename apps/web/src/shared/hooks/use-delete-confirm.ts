'use client';

import { useCallback, useState } from 'react';

/**
 * Holds a pending item until the user confirms or cancels a delete.
 */
export const useDeleteConfirm = <T,>() => {
  const [pending, setPending] = useState<T | null>(null);

  const request = useCallback((item: T) => {
    setPending(item);
  }, []);

  const cancel = useCallback(() => {
    setPending(null);
  }, []);

  const run = useCallback(
    async (action: (item: T) => Promise<void>): Promise<void> => {
      if (pending == null) {
        return;
      }
      await action(pending);
      setPending(null);
    },
    [pending],
  );

  return { pending, open: pending != null, request, cancel, run };
};
