import type {
  PublicApartmentDetail,
  PublicBuilderDetail,
  PublicPartnerDetail,
  PublicProjectDetail,
} from '@toonexpo/contracts';

import { buildAbsoluteUrl, truncateSeoText } from './metadata';

export type JsonLdObject = Record<string, unknown>;

type ProjectJsonLdInput = {
  project: PublicProjectDetail;
  locale: string;
  appUrl: string;
};

type ApartmentJsonLdInput = {
  apartment: PublicApartmentDetail;
  locale: string;
  appUrl: string;
};

type OrganizationJsonLdInput = {
  name: string;
  slug: string;
  locale: string;
  appUrl: string;
  description?: string | null;
  logoUrl?: string | null;
  urlPathPrefix: 'partners' | 'builders';
  telephone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
};

export function buildProjectRealEstateListingJsonLd({
  project,
  locale,
  appUrl,
}: ProjectJsonLdInput): JsonLdObject {
  const pageUrl = buildAbsoluteUrl(
    appUrl,
    `/${locale}/projects/${project.companySlug}/${project.slug}`,
  );
  const description = truncateSeoText(project.description);
  const image = project.coverImageUrl ?? project.media[0]?.url ?? undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: project.name,
    url: pageUrl,
    ...(description ? { description } : {}),
    ...(image ? { image } : {}),
    ...(project.address || project.city
      ? {
          address: {
            '@type': 'PostalAddress',
            ...(project.address ? { streetAddress: project.address } : {}),
            ...(project.city ? { addressLocality: project.city } : {}),
          },
        }
      : {}),
    seller: {
      '@type': 'Organization',
      name: project.companyName,
      url: buildAbsoluteUrl(appUrl, `/${locale}/builders/${project.companySlug}`),
    },
  };
}

export function buildApartmentJsonLd({
  apartment,
  locale,
  appUrl,
}: ApartmentJsonLdInput): JsonLdObject {
  const pageUrl = buildAbsoluteUrl(
    appUrl,
    `/${locale}/projects/${apartment.project.companySlug}/${apartment.project.slug}/apartments/${apartment.id}`,
  );
  const image = apartment.media[0]?.url ?? undefined;
  const name = `${apartment.project.name} — ${apartment.code}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Apartment',
    name,
    url: pageUrl,
    ...(image ? { image } : {}),
    ...(apartment.rooms != null ? { numberOfRooms: apartment.rooms } : {}),
    ...(apartment.areaSqm != null
      ? {
          floorSize: {
            '@type': 'QuantitativeValue',
            value: apartment.areaSqm,
            unitCode: 'MTK',
          },
        }
      : {}),
    ...(apartment.priceAmd != null
      ? {
          offers: {
            '@type': 'Offer',
            price: apartment.priceAmd,
            priceCurrency: 'AMD',
            availability:
              apartment.status === 'AVAILABLE'
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
          },
        }
      : {}),
    isPartOf: {
      '@type': 'RealEstateListing',
      name: apartment.project.name,
      url: buildAbsoluteUrl(
        appUrl,
        `/${locale}/projects/${apartment.project.companySlug}/${apartment.project.slug}`,
      ),
    },
  };
}

export function buildOrganizationJsonLd({
  name,
  slug,
  locale,
  appUrl,
  description,
  logoUrl,
  urlPathPrefix,
  telephone,
  email,
  website,
  address,
  city,
}: OrganizationJsonLdInput): JsonLdObject {
  const pageUrl = buildAbsoluteUrl(appUrl, `/${locale}/${urlPathPrefix}/${slug}`);
  const desc = truncateSeoText(description);

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url: website?.trim() || pageUrl,
    ...(desc ? { description: desc } : {}),
    ...(logoUrl ? { logo: logoUrl } : {}),
    ...(telephone ? { telephone } : {}),
    ...(email ? { email } : {}),
    ...(address || city
      ? {
          address: {
            '@type': 'PostalAddress',
            ...(address ? { streetAddress: address } : {}),
            ...(city ? { addressLocality: city } : {}),
          },
        }
      : {}),
  };
}

export function buildPartnerOrganizationJsonLd(
  partner: PublicPartnerDetail,
  locale: string,
  appUrl: string,
): JsonLdObject {
  return buildOrganizationJsonLd({
    name: partner.name,
    slug: partner.slug,
    locale,
    appUrl,
    description: partner.description,
    logoUrl: partner.logoUrl,
    urlPathPrefix: 'partners',
    telephone: partner.phone,
    email: partner.email,
    website: partner.website,
  });
}

export function buildBuilderOrganizationJsonLd(
  builder: PublicBuilderDetail,
  locale: string,
  appUrl: string,
): JsonLdObject {
  return buildOrganizationJsonLd({
    name: builder.name,
    slug: builder.slug,
    locale,
    appUrl,
    description: builder.description,
    logoUrl: builder.logoUrl,
    urlPathPrefix: 'builders',
    telephone: builder.phone,
    email: builder.email,
    website: builder.website,
    address: builder.address,
    city: builder.city,
  });
}
