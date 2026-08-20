/**
 * True when a project card has a numeric price to show.
 */
export const hasVisibleCatalogPrice = (
  minPrice: string | null | undefined,
  maxPrice?: string | null | undefined,
): boolean => (minPrice != null && minPrice !== '') || (maxPrice != null && maxPrice !== '');

/**
 * Show the Price on request button when the builder enabled the mode,
 * or when there is no numeric price to display.
 */
export const shouldShowPriceOnRequestCta = (input: {
  priceOnRequest: boolean;
  minPrice: string | null | undefined;
  maxPrice?: string | null | undefined;
}): boolean => input.priceOnRequest || !hasVisibleCatalogPrice(input.minPrice, input.maxPrice);
