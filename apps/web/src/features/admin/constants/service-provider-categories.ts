/** Built-in category names shown in the New Provider dropdown. */
export const SERVICE_PROVIDER_FORM_CATEGORY_NAMES = ['SMM', 'UI/UX'] as const;

export type ServiceProviderFormCategoryName = (typeof SERVICE_PROVIDER_FORM_CATEGORY_NAMES)[number];
