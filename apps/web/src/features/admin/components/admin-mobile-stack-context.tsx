'use client';

import { createContext, useContext } from 'react';

type AdminMobileStackContextValue = {
  onBack: (() => void) | null;
};

const AdminMobileStackContext = createContext<AdminMobileStackContextValue>({
  onBack: null,
});

export const AdminMobileStackProvider = AdminMobileStackContext.Provider;

/** Back handler while a mobile admin sheet is open; null on the hub / desktop. */
export const useAdminMobileStackBack = (): (() => void) | null => {
  return useContext(AdminMobileStackContext).onBack;
};
