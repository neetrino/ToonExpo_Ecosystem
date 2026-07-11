/**
 * Returns published SERVICE_COMPANY partners whose serviceCategories include
 * the readiness category's mapped serviceCategoryKey.
 */
export function partnerMatchesServiceCategory(
  serviceCategories: readonly string[],
  serviceCategoryKey: string | null | undefined,
): boolean {
  if (!serviceCategoryKey) {
    return false;
  }
  return serviceCategories.includes(serviceCategoryKey);
}

export type ProviderSuggestionInput = {
  id: string;
  name: string;
  slug: string;
  serviceCategories: readonly string[];
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
};

export function filterProvidersForServiceCategory(
  partners: readonly ProviderSuggestionInput[],
  serviceCategoryKey: string | null | undefined,
): ProviderSuggestionInput[] {
  if (!serviceCategoryKey) {
    return [];
  }
  return partners.filter((partner) =>
    partnerMatchesServiceCategory(partner.serviceCategories, serviceCategoryKey),
  );
}
