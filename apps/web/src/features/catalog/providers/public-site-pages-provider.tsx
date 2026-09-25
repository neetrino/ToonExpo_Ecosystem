'use client';

import type { PublicSitePageKey, PublicSitePages } from '@toonexpo/contracts';
import { PUBLIC_SITE_PAGE_KEYS } from '@toonexpo/contracts';
import { createContext, useContext, type ReactNode } from 'react';

type PublicSitePagesContextValue = {
  pages: PublicSitePages;
  isPageEnabled: (key: PublicSitePageKey) => boolean;
};

const defaultPages = (): PublicSitePages => {
  const pages = {} as PublicSitePages;
  for (const key of PUBLIC_SITE_PAGE_KEYS) {
    pages[key] = true;
  }
  return pages;
};

const PublicSitePagesContext = createContext<PublicSitePagesContextValue>({
  pages: defaultPages(),
  isPageEnabled: () => true,
});

type PublicSitePagesProviderProps = {
  pages: PublicSitePages;
  children: ReactNode;
};

/**
 * Supplies public marketing page visibility to chrome (header, bottom nav, footer).
 */
export const PublicSitePagesProvider = ({ pages, children }: PublicSitePagesProviderProps) => (
  <PublicSitePagesContext.Provider
    value={{
      pages,
      isPageEnabled: (key) => pages[key] !== false,
    }}
  >
    {children}
  </PublicSitePagesContext.Provider>
);

export const usePublicSitePages = (): PublicSitePagesContextValue =>
  useContext(PublicSitePagesContext);
