import type {
  AdminPartnerDetail,
  PartnerOfferItem,
  PortalPartnerDetail,
} from "@toonexpo/contracts";

import type {
  PartnerOfferFormValues,
  PartnerProfileFormValues,
  UpdatePartnerFormValues,
} from "@/features/partners/schemas/partner.schema";

const readSocial = (
  links: Record<string, string> | null | undefined,
  key: string,
): string => links?.[key] ?? "";

export const toUpdatePartnerFormValues = (
  partner: AdminPartnerDetail,
): UpdatePartnerFormValues => ({
  type: partner.type,
  name: partner.name,
  slug: partner.slug,
  status: partner.status,
  publicationStatus: partner.publicationStatus,
  featured: partner.featured,
  shortDescriptionHy:
    partner.translations?.shortDescription?.hy ?? partner.shortDescription ?? "",
  shortDescriptionRu: partner.translations?.shortDescription?.ru ?? "",
  shortDescriptionEn: partner.translations?.shortDescription?.en ?? "",
  fullDescriptionHy:
    partner.translations?.fullDescription?.hy ?? partner.fullDescription ?? "",
  fullDescriptionRu: partner.translations?.fullDescription?.ru ?? "",
  fullDescriptionEn: partner.translations?.fullDescription?.en ?? "",
  contactPhone: partner.contacts?.phone ?? "",
  contactEmail: partner.contacts?.email ?? "",
  website: partner.website ?? "",
  socialFacebook: readSocial(partner.socialLinks, "facebook"),
  socialInstagram: readSocial(partner.socialLinks, "instagram"),
  socialLinkedin: readSocial(partner.socialLinks, "linkedin"),
});

export const toPartnerProfileFormValues = (
  partner: PortalPartnerDetail,
): PartnerProfileFormValues => ({
  shortDescriptionHy:
    partner.translations?.shortDescription?.hy ?? partner.shortDescription ?? "",
  shortDescriptionRu: partner.translations?.shortDescription?.ru ?? "",
  shortDescriptionEn: partner.translations?.shortDescription?.en ?? "",
  fullDescriptionHy:
    partner.translations?.fullDescription?.hy ?? partner.fullDescription ?? "",
  fullDescriptionRu: partner.translations?.fullDescription?.ru ?? "",
  fullDescriptionEn: partner.translations?.fullDescription?.en ?? "",
  contactPhone: partner.contacts?.phone ?? "",
  contactEmail: partner.contacts?.email ?? "",
  website: partner.website ?? "",
  socialFacebook: readSocial(partner.socialLinks, "facebook"),
  socialInstagram: readSocial(partner.socialLinks, "instagram"),
  socialLinkedin: readSocial(partner.socialLinks, "linkedin"),
});

export const toPartnerOfferFormValues = (
  offer: PartnerOfferItem,
): PartnerOfferFormValues => ({
  titleHy: offer.translations?.title?.hy ?? offer.title,
  titleRu: offer.translations?.title?.ru ?? "",
  titleEn: offer.translations?.title?.en ?? "",
  descriptionHy: offer.translations?.description?.hy ?? offer.description ?? "",
  descriptionRu: offer.translations?.description?.ru ?? "",
  descriptionEn: offer.translations?.description?.en ?? "",
  publicationStatus: offer.publicationStatus,
  sortOrder: offer.sortOrder,
});
