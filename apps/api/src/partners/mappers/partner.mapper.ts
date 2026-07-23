import type {
  AdminPartnerDetail,
  AdminPartnerListItem,
  PartnerContacts,
  PartnerOfferItem,
  PartnerOfferTranslationsInput,
  PartnerSocialLinks,
  PortalPartnerDetail,
  PublicPartnerDetail,
  PublicPartnerListItem,
  PublicPartnerOfferItem,
} from '@toonexpo/contracts';
import type { Prisma } from '@toonexpo/db';

import type { TranslationRow } from '../../catalog/utils/resolve-translation.js';
import {
  groupPartnerOfferTranslations,
  groupPartnerProfileTranslations,
} from '../utils/group-partner-translations.js';

type PartnerCompanyRow = Prisma.PartnerCompanyGetPayload<object>;
type PartnerOfferRow = Prisma.PartnerOfferGetPayload<object>;

type PartnerWithMedia = PartnerCompanyRow & {
  logoMedia?: { fileUrl: string } | null;
  coverMedia?: { fileUrl: string } | null;
};

export const toAdminPartnerListItem = (partner: PartnerWithMedia): AdminPartnerListItem => ({
  id: partner.id,
  companyId: partner.companyId,
  type: partner.type,
  name: partner.name,
  slug: partner.slug,
  status: partner.status,
  publicationStatus: partner.publicationStatus,
  featured: partner.featured,
  logoUrl: partner.logoMedia?.fileUrl ?? null,
  createdAt: partner.createdAt.toISOString(),
  updatedAt: partner.updatedAt.toISOString(),
});

export const toPartnerOfferItem = (
  offer: PartnerOfferRow,
  translations?: PartnerOfferTranslationsInput,
): PartnerOfferItem => ({
  id: offer.id,
  title: offer.title,
  description: offer.description,
  type: offer.type,
  publicationStatus: offer.publicationStatus,
  sortOrder: offer.sortOrder,
  createdAt: offer.createdAt.toISOString(),
  updatedAt: offer.updatedAt.toISOString(),
  ...(translations ? { translations } : {}),
});

export const toAdminPartnerDetail = (
  partner: PartnerWithMedia,
  offers: PartnerOfferRow[],
  translationRows: TranslationRow[],
): AdminPartnerDetail => {
  const offerTranslations = groupOfferTranslationsById(translationRows, offers);

  return {
    ...toAdminPartnerListItem(partner),
    logoMediaId: partner.logoMediaId,
    coverMediaId: partner.coverMediaId,
    shortDescription: partner.shortDescription,
    fullDescription: partner.fullDescription,
    contacts: parseContacts(partner.contacts),
    website: partner.website,
    socialLinks: parseSocialLinks(partner.socialLinks),
    translations: groupPartnerProfileTranslations(translationRows),
    offers: offers.map((offer) => toPartnerOfferItem(offer, offerTranslations.get(offer.id))),
  };
};

export const toPortalPartnerDetail = (
  partner: PartnerCompanyRow,
  offers: PartnerOfferRow[],
  translationRows: TranslationRow[],
): PortalPartnerDetail => {
  const offerTranslations = groupOfferTranslationsById(translationRows, offers);

  return {
    ...toAdminPartnerListItem(partner),
    logoMediaId: partner.logoMediaId,
    coverMediaId: partner.coverMediaId,
    shortDescription: partner.shortDescription,
    fullDescription: partner.fullDescription,
    contacts: parseContacts(partner.contacts),
    website: partner.website,
    socialLinks: parseSocialLinks(partner.socialLinks),
    translations: groupPartnerProfileTranslations(translationRows),
    offers: offers.map((offer) => toPartnerOfferItem(offer, offerTranslations.get(offer.id))),
  };
};

export const toPublicPartnerListItem = (
  partner: PartnerWithMedia,
  shortDescription: string | null,
): PublicPartnerListItem => ({
  id: partner.id,
  type: partner.type,
  name: partner.name,
  slug: partner.slug,
  shortDescription,
  logoUrl: partner.logoMedia?.fileUrl ?? null,
  featured: partner.featured,
});

export const toPublicPartnerDetail = (
  partner: PartnerWithMedia,
  offers: PartnerOfferRow[],
  localized: {
    shortDescription: string | null;
    fullDescription: string | null;
    offerTexts: Map<string, { title: string; description: string | null }>;
  },
): PublicPartnerDetail => ({
  id: partner.id,
  type: partner.type,
  name: partner.name,
  slug: partner.slug,
  shortDescription: localized.shortDescription,
  fullDescription: localized.fullDescription,
  contacts: parseContacts(partner.contacts),
  website: partner.website,
  socialLinks: parseSocialLinks(partner.socialLinks),
  logoUrl: partner.logoMedia?.fileUrl ?? null,
  coverUrl: partner.coverMedia?.fileUrl ?? null,
  featured: partner.featured,
  offers: offers.map((offer) =>
    toPublicPartnerOfferItem(offer, localized.offerTexts.get(offer.id)),
  ),
});

const toPublicPartnerOfferItem = (
  offer: PartnerOfferRow,
  localized?: { title: string; description: string | null },
): PublicPartnerOfferItem => ({
  id: offer.id,
  title: localized?.title ?? offer.title,
  description: localized?.description ?? offer.description,
  type: offer.type,
  sortOrder: offer.sortOrder,
});

const groupOfferTranslationsById = (
  rows: TranslationRow[],
  offers: PartnerOfferRow[],
): Map<string, PartnerOfferTranslationsInput> => {
  const map = new Map<string, PartnerOfferTranslationsInput>();

  for (const offer of offers) {
    const offerRows = rows.filter((row) => row.entityId === offer.id);
    const translations = groupPartnerOfferTranslations(offerRows);
    if (Object.keys(translations).length > 0) {
      map.set(offer.id, translations);
    }
  }

  return map;
};

export const parseContacts = (value: Prisma.JsonValue): PartnerContacts | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const phone = typeof record['phone'] === 'string' ? record['phone'] : undefined;
  const email = typeof record['email'] === 'string' ? record['email'] : undefined;

  if (!phone && !email) {
    return null;
  }

  return { ...(phone ? { phone } : {}), ...(email ? { email } : {}) };
};

export const parseSocialLinks = (value: Prisma.JsonValue): PartnerSocialLinks | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const entries = Object.entries(value as Record<string, unknown>).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string',
  );

  return entries.length > 0 ? Object.fromEntries(entries) : null;
};
