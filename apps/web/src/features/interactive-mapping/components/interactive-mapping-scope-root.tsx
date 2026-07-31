'use client';

import type { ReactNode } from 'react';

import {
  InteractiveMappingScopeProvider,
  type InteractiveMappingMode,
} from '../scope/interactive-mapping-scope';

type InteractiveMappingScopeRootProps = {
  mode: InteractiveMappingMode;
  children: ReactNode;
};

/**
 * Client boundary that pins Admin vs Builder mapping routes to separate
 * API prefixes and UI base paths (no cross-portal mixing).
 */
export const InteractiveMappingScopeRoot = ({
  mode,
  children,
}: InteractiveMappingScopeRootProps) => (
  <InteractiveMappingScopeProvider mode={mode}>{children}</InteractiveMappingScopeProvider>
);
