import type {
  AdminServiceProviderItem,
  PortalServiceProviderItem,
  ServiceProviderCategoryItem,
  ServiceProviderCategoryRef,
} from "@toonexpo/contracts";
import type { Prisma } from "@toonexpo/db";

const toIso = (value: Date): string => value.toISOString();

type CategoryRecord = Prisma.ServiceProviderCategoryGetPayload<object>;

type ProviderWithCategories = Prisma.ServiceProviderGetPayload<{
  include: {
    categories: {
      include: {
        category: { select: { id: true; name: true } };
      };
    };
  };
}>;

const toCategoryRef = (
  link: ProviderWithCategories["categories"][number],
): ServiceProviderCategoryRef => ({
  id: link.category.id,
  name: link.category.name,
});

const parseSocialLinks = (
  value: Prisma.JsonValue | null,
): Record<string, string> | null => {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const entries = Object.entries(value).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  );

  return entries.length > 0 ? Object.fromEntries(entries) : null;
};

export const toServiceProviderCategoryItem = (
  category: CategoryRecord,
): ServiceProviderCategoryItem => ({
  id: category.id,
  name: category.name,
  description: category.description,
  sortOrder: category.sortOrder,
  active: category.active,
  createdAt: toIso(category.createdAt),
  updatedAt: toIso(category.updatedAt),
});

export const toAdminServiceProviderItem = (
  provider: ProviderWithCategories,
): AdminServiceProviderItem => ({
  id: provider.id,
  name: provider.name,
  providerType: provider.providerType,
  description: provider.description,
  services: provider.services,
  phone: provider.phone,
  email: provider.email,
  website: provider.website,
  socialLinks: parseSocialLinks(provider.socialLinks),
  internalNotes: provider.internalNotes,
  active: provider.active,
  publicationStatus: provider.publicationStatus,
  categories: provider.categories.map(toCategoryRef),
  createdByUserId: provider.createdByUserId,
  updatedByUserId: provider.updatedByUserId,
  createdAt: toIso(provider.createdAt),
  updatedAt: toIso(provider.updatedAt),
});

export const toPortalServiceProviderItem = (
  provider: ProviderWithCategories,
): PortalServiceProviderItem => ({
  id: provider.id,
  name: provider.name,
  providerType: provider.providerType,
  description: provider.description,
  services: provider.services,
  phone: provider.phone,
  email: provider.email,
  website: provider.website,
  socialLinks: parseSocialLinks(provider.socialLinks),
});
