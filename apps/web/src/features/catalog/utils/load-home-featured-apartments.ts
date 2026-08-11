import { listApartments } from '@/features/catalog/api/catalog-api';
import { HOME_FEATURED_APARTMENT_LIMIT } from '@/features/catalog/constants/home-featured';
import type { BuyApartmentListing } from '@/features/catalog/utils/load-buy-apartments';
import {
  loadBuyApartmentListings,
  toBuyApartmentListing,
} from '@/features/catalog/utils/load-buy-apartments';

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
    return curated.data.map(toBuyApartmentListing);
  }

  const fallback = await loadBuyApartmentListings({
    locale,
    filters: { page: 1, pageSize: HOME_FEATURED_APARTMENT_LIMIT, salesStatus: 'available' },
    limit: HOME_FEATURED_APARTMENT_LIMIT,
  });

  return fallback.data;
};
