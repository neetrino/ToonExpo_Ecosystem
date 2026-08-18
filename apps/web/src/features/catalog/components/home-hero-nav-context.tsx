'use client';

import { createContext, useContext, type ReactNode } from 'react';

import type { HomeHeroRotation } from '@/features/catalog/hooks/use-home-hero-rotation';

type HomeHeroNavContextValue = Pick<HomeHeroRotation, 'canRotate' | 'goBy'>;

const HomeHeroNavContext = createContext<HomeHeroNavContextValue | null>(null);

type HomeHeroNavProviderProps = {
  value: HomeHeroNavContextValue;
  children: ReactNode;
};

/**
 * Shares hero slide prev/next with the search card overlay on small screens.
 */
export const HomeHeroNavProvider = ({ value, children }: HomeHeroNavProviderProps) => (
  <HomeHeroNavContext.Provider value={value}>{children}</HomeHeroNavContext.Provider>
);

export const useHomeHeroNav = (): HomeHeroNavContextValue | null =>
  useContext(HomeHeroNavContext);
