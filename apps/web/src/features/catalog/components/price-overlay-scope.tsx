"use client";

import type {
  ApartmentPriceOverlayItem,
  ProjectPriceRangeOverlay,
} from "@toonexpo/contracts";
import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import { useMeQuery } from "@/features/auth/hooks/use-auth";
import { CATALOG_PRICES_BATCH_LIMIT } from "@/features/catalog/constants";
import {
  useProjectPriceRangesOverlayQuery,
  useProjectPricesOverlayQuery,
} from "@/features/catalog/hooks/use-price-overlay";

type PriceOverlayContextValue = {
  getProjectRange: (projectId: string) => ProjectPriceRangeOverlay | undefined;
  getApartmentPrice: (
    apartmentId: string,
  ) => ApartmentPriceOverlayItem | undefined;
};

const PriceOverlayContext = createContext<PriceOverlayContextValue | null>(
  null,
);

const EMPTY_OVERLAY: PriceOverlayContextValue = {
  getProjectRange: () => undefined,
  getApartmentPrice: () => undefined,
};

/** Overlay accessors; safe no-op outside a scope (SSR/anonymous markup unchanged). */
export const usePriceOverlay = (): PriceOverlayContextValue =>
  useContext(PriceOverlayContext) ?? EMPTY_OVERLAY;

type ProjectPricesOverlayScopeProps = {
  projectId: string;
  children: ReactNode;
};

/**
 * Authenticated price overlay for one project detail scope (project,
 * building, floor and apartment pages). Anonymous sessions: no request,
 * children keep the cached anonymous SSR values.
 */
export const ProjectPricesOverlayScope = ({
  projectId,
  children,
}: ProjectPricesOverlayScopeProps) => {
  const { data: user } = useMeQuery();
  const query = useProjectPricesOverlayQuery(projectId, user != null);

  const value = useMemo<PriceOverlayContextValue>(() => {
    const overlay = query.data;
    if (!overlay) {
      return EMPTY_OVERLAY;
    }

    const apartmentPrices = new Map(
      overlay.apartments.map((apartment) => [apartment.id, apartment]),
    );
    const range: ProjectPriceRangeOverlay = {
      projectId: overlay.projectId,
      minPrice: overlay.minPrice,
      maxPrice: overlay.maxPrice,
      priceCurrency: overlay.priceCurrency,
    };

    return {
      getProjectRange: (id) => (id === range.projectId ? range : undefined),
      getApartmentPrice: (id) => apartmentPrices.get(id),
    };
  }, [query.data]);

  return (
    <PriceOverlayContext.Provider value={value}>
      {children}
    </PriceOverlayContext.Provider>
  );
};

type ProjectPriceRangesOverlayScopeProps = {
  projectIds: string[];
  children: ReactNode;
};

/**
 * Authenticated min/max range overlay for project card lists
 * (projects list, home featured band, builder detail).
 */
export const ProjectPriceRangesOverlayScope = ({
  projectIds,
  children,
}: ProjectPriceRangesOverlayScopeProps) => {
  const { data: user } = useMeQuery();
  const cappedIds = useMemo(
    () => [...new Set(projectIds)].sort().slice(0, CATALOG_PRICES_BATCH_LIMIT),
    [projectIds],
  );
  const query = useProjectPriceRangesOverlayQuery(cappedIds, user != null);

  const value = useMemo<PriceOverlayContextValue>(() => {
    const ranges = query.data?.data;
    if (!ranges) {
      return EMPTY_OVERLAY;
    }

    const rangeMap = new Map(ranges.map((range) => [range.projectId, range]));
    return {
      getProjectRange: (id) => rangeMap.get(id),
      getApartmentPrice: () => undefined,
    };
  }, [query.data]);

  return (
    <PriceOverlayContext.Provider value={value}>
      {children}
    </PriceOverlayContext.Provider>
  );
};
