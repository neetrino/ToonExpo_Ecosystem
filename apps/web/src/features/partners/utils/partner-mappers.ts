import type {
  CreateAdminPartnerBody,
  CreatePartnerOfferBody,
  PartnerContacts,
  PartnerOfferTranslationsInput,
  PartnerProfileTranslationsInput,
  UpdateAdminPartnerBody,
  UpdatePartnerOfferBody,
  UpdatePortalPartnerBody,
} from "@toonexpo/contracts";

import type {
  CreatePartnerFormValues,
  PartnerOfferFormValues,
  PartnerProfileFormValues,
  UpdatePartnerFormValues,
} from "@/features/partners/schemas/partner.schema";

const optionalText = (value: string): string | undefined =>
  value.length > 0 ? value : undefined;

const buildLocaleMap = (
  hy: string,
  ru: string,
  en: string,
): { hy?: string; ru?: string; en?: string } | undefined => {
  const map: { hy?: string; ru?: string; en?: string } = {};
  if (hy.length > 0) {
    map.hy = hy;
  }
  if (ru.length > 0) {
    map.ru = ru;
  }
  if (en.length > 0) {
    map.en = en;
  }
  return Object.keys(map).length > 0 ? map : undefined;
};

export const buildPartnerProfileTranslations = (
  values: Pick<
    PartnerProfileFormValues,
    | "shortDescriptionHy"
    | "shortDescriptionRu"
    | "shortDescriptionEn"
    | "fullDescriptionHy"
    | "fullDescriptionRu"
    | "fullDescriptionEn"
  >,
): PartnerProfileTranslationsInput | undefined => {
  const shortDescription = buildLocaleMap(
    values.shortDescriptionHy,
    values.shortDescriptionRu,
    values.shortDescriptionEn,
  );
  const fullDescription = buildLocaleMap(
    values.fullDescriptionHy,
    values.fullDescriptionRu,
    values.fullDescriptionEn,
  );

  const translations: PartnerProfileTranslationsInput = {};
  if (shortDescription) {
    translations.shortDescription = shortDescription;
  }
  if (fullDescription) {
    translations.fullDescription = fullDescription;
  }

  return Object.keys(translations).length > 0 ? translations : undefined;
};

export const buildPartnerOfferTranslations = (
  values: Pick<
    PartnerOfferFormValues,
    "titleHy" | "titleRu" | "titleEn" | "descriptionHy" | "descriptionRu" | "descriptionEn"
  >,
): PartnerOfferTranslationsInput | undefined => {
  const title = buildLocaleMap(values.titleHy, values.titleRu, values.titleEn);
  const description = buildLocaleMap(
    values.descriptionHy,
    values.descriptionRu,
    values.descriptionEn,
  );

  const translations: PartnerOfferTranslationsInput = {};
  if (title) {
    translations.title = title;
  }
  if (description) {
    translations.description = description;
  }

  return Object.keys(translations).length > 0 ? translations : undefined;
};

const buildContacts = (
  phone: string,
  email: string,
): PartnerContacts | null | undefined => {
  const contacts: PartnerContacts = {};
  if (phone.length > 0) {
    contacts.phone = phone;
  }
  if (email.length > 0) {
    contacts.email = email;
  }
  return Object.keys(contacts).length > 0 ? contacts : null;
};

const buildSocialLinks = (
  facebook: string,
  instagram: string,
  linkedin: string,
): Record<string, string> | null => {
  const links: Record<string, string> = {};
  if (facebook.length > 0) {
    links["facebook"] = facebook;
  }
  if (instagram.length > 0) {
    links["instagram"] = instagram;
  }
  if (linkedin.length > 0) {
    links["linkedin"] = linkedin;
  }
  return Object.keys(links).length > 0 ? links : null;
};

export const toCreatePartnerBody = (
  values: CreatePartnerFormValues,
): CreateAdminPartnerBody => ({
  companyId: values.companyId,
  type: values.type,
  name: values.name,
  ...(optionalText(values.slug) ? { slug: values.slug } : {}),
});

export const toUpdatePartnerBody = (
  values: UpdatePartnerFormValues,
): UpdateAdminPartnerBody => {
  const translations = buildPartnerProfileTranslations(values);
  const contacts = buildContacts(values.contactPhone, values.contactEmail);
  return {
    type: values.type,
    name: values.name,
    slug: values.slug,
    shortDescription: values.shortDescriptionHy || null,
    fullDescription: values.fullDescriptionHy || null,
    contacts: contacts ?? null,
    website: optionalText(values.website) ?? null,
    socialLinks: buildSocialLinks(
      values.socialFacebook,
      values.socialInstagram,
      values.socialLinkedin,
    ),
    status: values.status,
    publicationStatus: values.publicationStatus,
    featured: values.featured,
    ...(translations ? { translations } : {}),
  };
};

export const toUpdatePortalPartnerBody = (
  values: PartnerProfileFormValues,
): UpdatePortalPartnerBody => {
  const translations = buildPartnerProfileTranslations(values);
  const contacts = buildContacts(values.contactPhone, values.contactEmail);
  return {
    shortDescription: values.shortDescriptionHy || null,
    fullDescription: values.fullDescriptionHy || null,
    contacts: contacts ?? null,
    website: optionalText(values.website) ?? null,
    socialLinks: buildSocialLinks(
      values.socialFacebook,
      values.socialInstagram,
      values.socialLinkedin,
    ),
    ...(translations ? { translations } : {}),
  };
};

export const toCreatePartnerOfferBody = (
  values: PartnerOfferFormValues,
): CreatePartnerOfferBody => {
  const translations = buildPartnerOfferTranslations(values);
  const description = optionalText(values.descriptionHy);
  return {
    title: values.titleHy,
    ...(description ? { description } : {}),
    publicationStatus: values.publicationStatus,
    sortOrder: values.sortOrder,
    ...(translations ? { translations } : {}),
  };
};

export const toUpdatePartnerOfferBody = (
  values: PartnerOfferFormValues,
): UpdatePartnerOfferBody => {
  const translations = buildPartnerOfferTranslations(values);
  return {
    title: values.titleHy,
    description: values.descriptionHy || null,
    publicationStatus: values.publicationStatus,
    sortOrder: values.sortOrder,
    ...(translations ? { translations } : {}),
  };
};
