import type { ApartmentListItem, PriceVisibility } from '@toonexpo/contracts';

import { listApartments } from '@/features/catalog/api/catalog-api';
import type { ProjectFilterParams } from '@/features/catalog/utils/project-filters';

const BUY_APARTMENT_LIMIT = 24;

export type BuyApartmentListing = {
  id: string;
  title: string;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  areaTotal: string | null;
  price: string | null;
  priceCurrency: string;
  priceVisibility: PriceVisibility;
  salesStatus: ApartmentListItem['salesStatus'];
  locationLine: string | null;
  image: { src: string; alt: string } | null;
  latitude: number | null;
  longitude: number | null;
  projectId: string;
  projectName: string;
};

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
    title: apartment.number,
    rooms: apartment.rooms,
    bedrooms: apartment.bedrooms,
    bathrooms: apartment.bathrooms,
    areaTotal: apartment.areaTotal,
    price: apartment.price,
    priceCurrency: apartment.priceCurrency,
    priceVisibility: apartment.priceVisibility,
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
  };
};

/**
 * Loads Buy-page apartment cards from the public apartments catalog.
 */
export const loadBuyApartmentListings = async (options: {
  locale: string;
  filters: ProjectFilterParams;
  limit?: number;
}): Promise<BuyApartmentListing[]> => {
  const { locale, filters } = options;
  const limit = options.limit ?? BUY_APARTMENT_LIMIT;
  const pageSize = Math.min(limit, filters.pageSize || BUY_APARTMENT_LIMIT);

  const response = await listApartments(
    {
      page: filters.page || 1,
      pageSize,
      ...(filters.salesStatus ? { salesStatus: filters.salesStatus } : {}),
      ...(filters.minPrice != null ? { minPrice: filters.minPrice } : {}),
      ...(filters.maxPrice != null ? { maxPrice: filters.maxPrice } : {}),
      ...(filters.rooms != null && filters.rooms.length > 0 ? { rooms: filters.rooms } : {}),
      ...(filters.city ? { city: filters.city } : {}),
      ...(filters.builderId ? { builderId: filters.builderId } : {}),
      ...(filters.q ? { q: filters.q } : {}),
    },
    { locale },
  );

  return response.data.slice(0, limit).map(toBuyApartmentListing);
};

const toCoord = (value: string | null): number | null => {
  if (value == null || value.trim() === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};
