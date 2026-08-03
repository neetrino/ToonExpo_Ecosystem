'use client';

import { createContext, useContext, type ReactNode } from 'react';

type PortalRailCollapseContextValue = {
  /** Desktop rail is in icons-only mode. Always false below `md`. */
  collapsed: boolean;
};

const PortalRailCollapseContext = createContext<PortalRailCollapseContextValue>({
  collapsed: false,
});

type PortalRailCollapseProviderProps = {
  collapsed: boolean;
  children: ReactNode;
};

export const PortalRailCollapseProvider = ({
  collapsed,
  children,
}: PortalRailCollapseProviderProps) => {
  return (
    <PortalRailCollapseContext.Provider value={{ collapsed }}>
      {children}
    </PortalRailCollapseContext.Provider>
  );
};

/** Whether the desktop portal rail is collapsed (icons-only). */
export const usePortalRailCollapsed = (): boolean => {
  return useContext(PortalRailCollapseContext).collapsed;
};
