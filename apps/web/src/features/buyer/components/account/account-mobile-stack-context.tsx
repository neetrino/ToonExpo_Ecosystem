'use client';

import { createContext, useContext } from 'react';

type AccountMobileStackContextValue = {
  onBack: (() => void) | null;
};

const AccountMobileStackContext = createContext<AccountMobileStackContextValue>({
  onBack: null,
});

export const AccountMobileStackProvider = AccountMobileStackContext.Provider;

/** Back handler while a mobile profile sheet is open; null on the hub / desktop. */
export const useAccountMobileStackBack = (): (() => void) | null => {
  return useContext(AccountMobileStackContext).onBack;
};
