import { listApartments } from '@/features/catalog/api/catalog-api';
import { HOME_FEATURED_APARTMENT_LIMIT } from '@/features/catalog/constants/home-featured';
import type { BuyApartmentListing } from '@/features/catalog/utils/load-buy-apartments';
import { toBuyApartmentListing } from '@/features/catalog/utils/load-buy-apartments';

/**
 * Homepage featured apartments — admin-curated pins only, so the band content is
 * fully controlled from the admin inventory screens.
 */
export const loadHomeFeaturedApartments = async (
  locale: string,
): Promise<BuyApartmentListing[]> => {
  const curated = await listApartments(
    {
      page: 1,
      pageSize: HOME_FEATURED_APARTMENT_LIMIT,
      featuredOnHome: true,
    },
    { locale, cacheMode: 'no-store' },
  );

  return curated.data.map(toBuyApartmentListing);
};
