import type { ApartmentListItem, PaginatedResponse, PriceVisibility } from '@toonexpo/contracts';

import { listApartments } from '@/features/catalog/api/catalog-api';
import type { ProjectFilterParams } from '@/features/catalog/utils/project-filters';

/** Buy /apartments grid — fewer cards per page than the projects catalog. */
export const BUY_APARTMENT_PAGE_SIZE = 10;
export type BuyApartmentListing = {
  id: string;
  slug: string;
  title: string;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  areaTotal: string | null;
  price: string | null;
  priceCurrency: string;
  priceVisibility: PriceVisibility;
  priceOnRequest: boolean;
  salesStatus: ApartmentListItem['salesStatus'];
  locationLine: string | null;
  image: { src: string; alt: string } | null;
  latitude: number | null;
  longitude: number | null;
  projectId: string;
  projectName: string;
  verified: boolean;
};

export type BuyApartmentListingsPage = PaginatedResponse<BuyApartmentListing>;

/**
 * Maps a public apartment list row to Buy-page card props.
 */
export const toBuyApartmentListing = (apartment: ApartmentListItem): BuyApartmentListing => {
  const district = apartment.district?.trim() || null;
  const city = apartment.city?.trim() || null;
  const locationLine =
    district && city
      ? `${district} · ${city}`
      : apartment.locationText?.trim() || city || district || null;

  return {
    id: apartment.id,
    slug: apartment.slug,
    title: apartment.number,
    rooms: apartment.rooms,
    bedrooms: apartment.bedrooms,
    bathrooms: apartment.bathrooms,
    areaTotal: apartment.areaTotal,
    price: apartment.price,
    priceCurrency: apartment.priceCurrency,
    priceVisibility: apartment.priceVisibility,
    priceOnRequest: apartment.priceOnRequest,
    salesStatus: apartment.salesStatus,
    locationLine,
    image: apartment.cover
      ? {
          src: apartment.cover.fileUrl,
          alt: apartment.cover.altText ?? apartment.projectName,
        }
      : null,
    latitude: toCoord(apartment.latitude),
    longitude: toCoord(apartment.longitude),
    projectId: apartment.projectId,
    projectName: apartment.projectName,
    verified: apartment.verified,
  };
};

/**
 * Empty paginated Buy listings (Nest offline / soft-fail).
 */
export const emptyBuyApartmentListingsPage = (
  pageSize: number = BUY_APARTMENT_PAGE_SIZE,
): BuyApartmentListingsPage => ({
  data: [],
  meta: { page: 1, pageSize, total: 0, totalPages: 0 },
});

/**
 * Loads one page of Buy-page apartment cards from the public apartments catalog.
 */
export const loadBuyApartmentListings = async (options: {
  locale: string;
  filters: ProjectFilterParams;
  /** Overrides `filters.pageSize` (homepage featured band). */
  limit?: number;
}): Promise<BuyApartmentListingsPage> => {
  const { locale, filters } = options;
  const pageSize = options.limit ?? filters.pageSize ?? BUY_APARTMENT_PAGE_SIZE;
  const page = filters.page || 1;

  const response = await listApartments(
    {
      page,
      pageSize,
      ...(filters.salesStatus ? { salesStatus: filters.salesStatus } : {}),
      ...(filters.minPrice != null ? { minPrice: filters.minPrice } : {}),
      ...(filters.maxPrice != null ? { maxPrice: filters.maxPrice } : {}),
      ...(filters.rooms != null && filters.rooms.length > 0 ? { rooms: filters.rooms } : {}),
      ...(filters.city ? { city: filters.city } : {}),
      ...(filters.builderId ? { builderId: filters.builderId } : {}),
      ...(filters.q ? { q: filters.q } : {}),
    },
    // Inventory publishes from Admin must appear immediately (avoid stale Data Cache totals).
    { locale, cacheMode: 'no-store' },
  );

  return {
    data: response.data.map(toBuyApartmentListing),
    meta: response.meta,
  };
};

const toCoord = (value: string | null): number | null => {
  if (value == null || value.trim() === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};
