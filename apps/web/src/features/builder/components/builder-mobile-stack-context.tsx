'use client';

import { createContext, useContext } from 'react';

type BuilderMobileStackContextValue = {
  onBack: (() => void) | null;
};

const BuilderMobileStackContext = createContext<BuilderMobileStackContextValue>({
  onBack: null,
});

export const BuilderMobileStackProvider = BuilderMobileStackContext.Provider;

/** Back handler while a mobile builder sheet is open; null on the hub / desktop. */
export const useBuilderMobileStackBack = (): (() => void) | null => {
  return useContext(BuilderMobileStackContext).onBack;
};
