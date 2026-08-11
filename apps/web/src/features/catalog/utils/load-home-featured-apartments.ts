import type { ApartmentListItem } from '@toonexpo/contracts';

import { listApartments } from '@/features/catalog/api/catalog-api';
import {
  HOME_FEATURED_APARTMENT_LIMIT,
} from '@/features/catalog/constants/home-featured';
import type { BuyApartmentListing } from '@/features/catalog/utils/load-buy-apartments';
import { loadBuyApartmentListings } from '@/features/catalog/utils/load-buy-apartments';

const toBuyListing = (apartment: ApartmentListItem): BuyApartmentListing => {
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

const toCoord = (value: string | null): number | null => {
  if (value == null || value.trim() === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Homepage featured apartments — curated first, then catalog fallback.
 */
export const loadHomeFeaturedApartments = async (locale: string): Promise<BuyApartmentListing[]> => {
  const curated = await listApartments(
    {
      page: 1,
      pageSize: HOME_FEATURED_APARTMENT_LIMIT,
      featuredOnHome: true,
    },
    { locale, cacheMode: 'no-store' },
  );

  if (curated.data.length > 0) {
    return curated.data.map(toBuyListing);
  }

  return loadBuyApartmentListings({
    locale,
    filters: { page: 1, pageSize: HOME_FEATURED_APARTMENT_LIMIT, salesStatus: 'available' },
    limit: HOME_FEATURED_APARTMENT_LIMIT,
  });
};
