import type {
  ApartmentAvailabilitySummary,
  MediaAssetSummary,
} from "@toonexpo/contracts";
import type { ApartmentSalesStatus, Prisma } from "@toonexpo/db";

import { PUBLIC_PUBLICATION_STATUS } from "../catalog.constants.js";

type MediaRow = {
  id: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  altText: string | null;
} | null;

export const toMediaSummary = (media: MediaRow): MediaAssetSummary | null => {
  if (!media) {
    return null;
  }

  return {
    id: media.id,
    fileUrl: media.fileUrl,
    thumbnailUrl: media.thumbnailUrl,
    altText: media.altText,
  };
};

export const decimalToString = (value: Prisma.Decimal | null | undefined): string | null => {
  if (value == null) {
    return null;
  }

  return value.toString();
};

export const emptyAvailability = (): ApartmentAvailabilitySummary => ({
  total: 0,
  available: 0,
  reserved: 0,
  sold: 0,
});

export const summarizeSalesStatuses = (
  statuses: ApartmentSalesStatus[],
): ApartmentAvailabilitySummary => {
  const summary = emptyAvailability();
  summary.total = statuses.length;

  for (const status of statuses) {
    if (status === "available") {
      summary.available += 1;
    } else if (status === "reserved") {
      summary.reserved += 1;
    } else if (status === "sold") {
      summary.sold += 1;
    }
  }

  return summary;
};

export const publishedApartmentWhere = (): Prisma.ApartmentWhereInput => ({
  publicationStatus: PUBLIC_PUBLICATION_STATUS,
});

/**
 * Whether the numeric price may be included in a catalog API response.
 * Anonymous callers only see `public`; authenticated callers also see `visible_after_login`.
 */
export const shouldRevealPrice = (
  priceVisibility: string,
  isAuthenticated: boolean,
): boolean => {
  if (priceVisibility === "public") {
    return true;
  }

  return isAuthenticated && priceVisibility === "visible_after_login";
};
