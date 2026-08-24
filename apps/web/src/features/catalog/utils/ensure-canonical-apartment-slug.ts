import { redirect } from '@/i18n/navigation';

type ApartmentSlugRef = {
  slug: string;
};

/**
 * Redirects legacy `/apartments/{id}` URLs to the canonical slug route.
 */
export const ensureCanonicalApartmentSlug = (
  apartment: ApartmentSlugRef,
  apartmentSlug: string,
  locale: string,
  pathSuffix = '',
): void => {
  if (apartment.slug === apartmentSlug) {
    return;
  }

  redirect({
    href: `/apartments/${encodeURIComponent(apartment.slug)}${pathSuffix}`,
    locale,
  });
};
