import type {
  AdminServiceProviderItem,
  CreateServiceProviderBody,
  UpdateServiceProviderBody,
} from "@toonexpo/contracts";

import type { ServiceProviderFormValues } from "@/features/admin/schemas/service-provider.schema";

const buildSocialLinks = (
  facebook: string | undefined,
  instagram: string | undefined,
  linkedin: string | undefined,
): Record<string, string> | undefined => {
  const links: Record<string, string> = {};
  if (facebook && facebook.length > 0) {
    links["facebook"] = facebook;
  }
  if (instagram && instagram.length > 0) {
    links["instagram"] = instagram;
  }
  if (linkedin && linkedin.length > 0) {
    links["linkedin"] = linkedin;
  }
  return Object.keys(links).length > 0 ? links : undefined;
};

export const toCreateServiceProviderBody = (
  values: ServiceProviderFormValues,
): CreateServiceProviderBody => {
  const body: CreateServiceProviderBody = {
    name: values.name,
    providerType: values.providerType,
    active: values.active,
    categoryIds: values.categoryIds,
  };

  if (values.description && values.description.length > 0) {
    body.description = values.description;
  }
  if (values.services && values.services.length > 0) {
    body.services = values.services;
  }
  if (values.phone && values.phone.length > 0) {
    body.phone = values.phone;
  }
  if (values.email && values.email.length > 0) {
    body.email = values.email;
  }
  if (values.website && values.website.length > 0) {
    body.website = values.website;
  }
  if (values.internalNotes && values.internalNotes.length > 0) {
    body.internalNotes = values.internalNotes;
  }
  if (values.publicationStatus && values.publicationStatus.length > 0) {
    body.publicationStatus = values.publicationStatus;
  }

  const socialLinks = buildSocialLinks(
    values.socialFacebook,
    values.socialInstagram,
    values.socialLinkedin,
  );
  if (socialLinks) {
    body.socialLinks = socialLinks;
  }

  return body;
};

export const toUpdateServiceProviderBody = (
  values: ServiceProviderFormValues,
): UpdateServiceProviderBody => ({
  name: values.name,
  providerType: values.providerType,
  active: values.active,
  categoryIds: values.categoryIds,
  description: values.description?.length ? values.description : null,
  services: values.services?.length ? values.services : null,
  phone: values.phone?.length ? values.phone : null,
  email: values.email?.length ? values.email : null,
  website: values.website?.length ? values.website : null,
  internalNotes: values.internalNotes?.length ? values.internalNotes : null,
  publicationStatus:
    values.publicationStatus && values.publicationStatus.length > 0
      ? values.publicationStatus
      : null,
  socialLinks:
    buildSocialLinks(
      values.socialFacebook,
      values.socialInstagram,
      values.socialLinkedin,
    ) ?? null,
});

export const toServiceProviderFormValues = (
  provider: AdminServiceProviderItem,
): ServiceProviderFormValues => ({
  name: provider.name,
  providerType: provider.providerType,
  description: provider.description ?? "",
  services: provider.services ?? "",
  phone: provider.phone ?? "",
  email: provider.email ?? "",
  website: provider.website ?? "",
  socialFacebook: provider.socialLinks?.["facebook"] ?? "",
  socialInstagram: provider.socialLinks?.["instagram"] ?? "",
  socialLinkedin: provider.socialLinks?.["linkedin"] ?? "",
  internalNotes: provider.internalNotes ?? "",
  active: provider.active,
  publicationStatus: provider.publicationStatus ?? undefined,
  categoryIds: provider.categories.map((category) => category.id),
});
