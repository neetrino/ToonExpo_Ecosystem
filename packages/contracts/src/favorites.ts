/**
 * Buyer favorites contracts (saved projects / apartments).
 */

import type {
  ApartmentSalesStatus,
  PriceVisibility,
  ProjectListItem,
} from "./catalog.js";

export type FavoriteTargetType = "project" | "apartment";

/** Compact apartment card for favorites list (reuses catalog card fields). */
export type FavoriteApartmentCard = {
  id: string;
  number: string;
  salesStatus: ApartmentSalesStatus;
  rooms: number | null;
  areaTotal: string | null;
  price: string | null;
  priceCurrency: string;
  priceVisibility: PriceVisibility;
  project: {
    id: string;
    name: string;
    slug: string;
  };
  builder: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
};

export type FavoriteProjectListItem = {
  id: string;
  targetType: "project";
  targetId: string;
  savedAt: string;
  project: ProjectListItem;
};

export type FavoriteApartmentListItem = {
  id: string;
  targetType: "apartment";
  targetId: string;
  savedAt: string;
  apartment: FavoriteApartmentCard;
};

export type FavoriteListItem =
  | FavoriteProjectListItem
  | FavoriteApartmentListItem;

export type BuyerFavoritesListResponse = {
  items: FavoriteListItem[];
};

/** Batch heart status keys use `targetType:targetId`. */
export type BuyerFavoritesStatusResponse = {
  favorited: string[];
};
