import {
  publicApartmentDetailSchema,
  publicBuilderDetailSchema,
  publicBuilderSummarySchema,
  publicPartnerDetailSchema,
  publicPartnerSummarySchema,
  publicProjectDetailSchema,
  publicProjectSummarySchema,
  type PublicApartment,
  type PublicApartmentDetail,
  type PublicBankOffer,
  type PublicBuilderDetail,
  type PublicBuilderSummary,
  type PublicBuilding,
  type PublicMediaAsset,
  type PublicPartnerDetail,
  type PublicPartnerSummary,
  type PublicProjectDetail,
  type PublicProjectSummary,
} from '@toonexpo/contracts';
import type {
  ApartmentStatus,
  PartnerType,
  PriceDisplayMode,
  PriceVisibility,
} from '@toonexpo/domain';

const IS_DEV = process.env.NODE_ENV === 'development';

export type ProjectSummaryRow = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  company: { slug: string; name: string };
  media: { url: string }[];
};

export type ApartmentRow = {
  id: string;
  code: string;
  status: ApartmentStatus;
  areaSqm: number | null;
  rooms: number | null;
  priceAmd: number | null;
  priceVisibility: PriceVisibility;
};

export type ProjectDetailRow = ProjectSummaryRow & {
  description: string | null;
  address: string | null;
  media: { id: string; url: string; alt: string | null }[];
  company: ProjectSummaryRow['company'] & {
    description: string | null;
    logoUrl: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    city: string | null;
    address: string | null;
  };
  buildings: {
    id: string;
    name: string;
    description: string | null;
    floors: { id: string; name: string; level: number; apartments: ApartmentRow[] }[];
  }[];
};

export type PartnerSummaryRow = {
  id: string;
  name: string;
  slug: string;
  type: PartnerType;
  logoUrl: string | null;
  description: string | null;
};

export type BankOfferRow = {
  id: string;
  title: string;
  description: string | null;
  interestRate: number;
  minDownPaymentPercent: number;
  maxTermMonths: number;
  maxAmountAmd: number | null;
  featured: boolean;
};

function resolvePrice(
  visibility: PriceVisibility,
  priceAmd: number | null,
  authenticated: boolean,
): { priceDisplay: PriceDisplayMode; priceAmd: number | null } {
  if (visibility === 'HIDDEN' || visibility === 'BY_REQUEST') {
    return { priceDisplay: visibility, priceAmd: null };
  }
  if (visibility === 'VISIBLE_AFTER_LOGIN' && !authenticated) {
    return { priceDisplay: 'LOGIN_REQUIRED', priceAmd: null };
  }
  return { priceDisplay: 'AMOUNT', priceAmd };
}

export function mapProjectSummary(row: ProjectSummaryRow): PublicProjectSummary {
  return publicProjectSummarySchema.parse({
    id: row.id,
    slug: row.slug,
    companySlug: row.company.slug,
    companyName: row.company.name,
    name: row.name,
    city: row.city,
    coverImageUrl: row.media[0]?.url ?? null,
  });
}

function mapApartment(row: ApartmentRow, authenticated: boolean): PublicApartment {
  return {
    id: row.id,
    code: row.code,
    status: row.status,
    areaSqm: row.areaSqm,
    rooms: row.rooms,
    priceVisibility: row.priceVisibility,
    ...resolvePrice(row.priceVisibility, row.priceAmd, authenticated),
  };
}

function mapMedia(row: { id: string; url: string; alt: string | null }): PublicMediaAsset {
  return { id: row.id, url: row.url, alt: row.alt };
}

export function mapProjectDetail(
  row: ProjectDetailRow,
  authenticated: boolean,
): PublicProjectDetail {
  const buildings: PublicBuilding[] = row.buildings.map((building) => ({
    id: building.id,
    name: building.name,
    description: building.description,
    floors: building.floors.map((floor) => ({
      id: floor.id,
      name: floor.name,
      level: floor.level,
      apartments: floor.apartments.map((apartment) => mapApartment(apartment, authenticated)),
    })),
  }));
  const detail: PublicProjectDetail = {
    ...mapProjectSummary(row),
    description: row.description,
    address: row.address,
    media: row.media.map(mapMedia),
    buildings,
    companyDescription: row.company.description,
    companyLogoUrl: row.company.logoUrl,
    companyPhone: row.company.phone,
    companyEmail: row.company.email,
    companyWebsite: row.company.website,
    companyCity: row.company.city,
    companyAddress: row.company.address,
  };
  return IS_DEV ? publicProjectDetailSchema.parse(detail) : detail;
}

export function mapApartmentDetail(
  row: ApartmentRow & {
    matterportUrl: string | null;
    media: { id: string; url: string; alt: string | null }[];
    floor: {
      name: string;
      building: {
        name: string;
        project: {
          id: string;
          name: string;
          slug: string;
          companyId: string;
          company: { slug: string; name: string };
        };
      };
    };
  },
  authenticated: boolean,
): PublicApartmentDetail {
  const project = row.floor.building.project;
  return publicApartmentDetailSchema.parse({
    ...mapApartment(row, authenticated),
    matterportUrl: row.matterportUrl,
    buildingName: row.floor.building.name,
    floorName: row.floor.name,
    media: row.media.map(mapMedia),
    project: {
      id: project.id,
      name: project.name,
      slug: project.slug,
      companySlug: project.company.slug,
      companyName: project.company.name,
      companyId: project.companyId,
    },
  });
}

export function mapBuilderSummary(
  row: Omit<PublicBuilderSummary, 'publishedProjectCount'> & { _count: { projects: number } },
): PublicBuilderSummary {
  return publicBuilderSummarySchema.parse({ ...row, publishedProjectCount: row._count.projects });
}

export function mapBuilderDetail(
  row: Parameters<typeof mapBuilderSummary>[0] & {
    phone: string | null;
    email: string | null;
    website: string | null;
    address: string | null;
    projects: ProjectSummaryRow[];
  },
): PublicBuilderDetail {
  return publicBuilderDetailSchema.parse({
    ...mapBuilderSummary(row),
    phone: row.phone,
    email: row.email,
    website: row.website,
    address: row.address,
    projects: row.projects.map(mapProjectSummary),
  });
}

export function mapPartnerSummary(row: PartnerSummaryRow): PublicPartnerSummary {
  return publicPartnerSummarySchema.parse(row);
}

export function mapPartnerDetail(
  row: PartnerSummaryRow & {
    phone: string | null;
    email: string | null;
    website: string | null;
    serviceCategories: string[];
    bankOffers: BankOfferRow[];
  },
): PublicPartnerDetail {
  return publicPartnerDetailSchema.parse({
    ...mapPartnerSummary(row),
    phone: row.phone,
    email: row.email,
    website: row.website,
    serviceCategories: row.serviceCategories,
    bankOffers: row.bankOffers,
  });
}

export function mapBankOffer(row: BankOfferRow): PublicBankOffer {
  return row;
}
