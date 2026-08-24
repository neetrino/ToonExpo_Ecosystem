'use client';

import { createContext, useContext, type ReactNode } from 'react';

type AdminProjectRoute = {
  projectId: string;
  projectSlug: string;
};

const AdminProjectRouteContext = createContext<AdminProjectRoute | null>(null);

type AdminProjectRouteProviderProps = {
  value: AdminProjectRoute;
  children: ReactNode;
};

export const AdminProjectRouteProvider = ({
  value,
  children,
}: AdminProjectRouteProviderProps) => (
  <AdminProjectRouteContext.Provider value={value}>{children}</AdminProjectRouteContext.Provider>
);

/** Resolved admin project route (id for APIs, slug for URLs). */
export const useAdminProjectRoute = (): AdminProjectRoute => {
  const value = useContext(AdminProjectRouteContext);
  if (!value) {
    throw new Error('useAdminProjectRoute requires AdminProjectRouteProvider');
  }
  return value;
};
