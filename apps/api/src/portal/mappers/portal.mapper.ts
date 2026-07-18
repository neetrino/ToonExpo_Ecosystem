import type {
  PortalApartmentDetail,
  PortalBuildingSummary,
  PortalFloorSummary,
  PortalProjectDetail,
  PortalProjectListItem,
} from "@toonexpo/contracts";
import type { Prisma } from "@toonexpo/db";

const decimalToString = (
  value: Prisma.Decimal | null | undefined,
): string | null => (value == null ? null : value.toString());

const dateToIsoDate = (value: Date | null | undefined): string | null =>
  value == null ? null : value.toISOString().slice(0, 10);

type ProjectListRow = {
  id: string;
  name: string;
  slug: string;
  publicationStatus: PortalProjectListItem["publicationStatus"];
  shortDescription: string | null;
  locationText: string | null;
  city: string | null;
  district: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: { buildings: number; apartments: number };
};

type FloorRow = {
  id: string;
  buildingId: string;
  number: number;
  publicationStatus: PortalFloorSummary["publicationStatus"];
  name: string | null;
  displayLabel: string | null;
  displayOrder: number;
  description: string | null;
  floorplanMediaId: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: { apartments: number };
};

type BuildingRow = {
  id: string;
  projectId: string;
  name: string;
  publicationStatus: PortalBuildingSummary["publicationStatus"];
  description: string | null;
  displayOrder: number;
  floorsCount: number | null;
  coverMediaId: string | null;
  createdAt: Date;
  updatedAt: Date;
  floors: FloorRow[];
};

type ProjectDetailRow = {
  id: string;
  builderCompanyId: string;
  name: string;
  slug: string;
  publicationStatus: PortalProjectDetail["publicationStatus"];
  shortDescription: string | null;
  fullDescription: string | null;
  locationText: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  latitude: Prisma.Decimal | null;
  longitude: Prisma.Decimal | null;
  projectType: string | null;
  constructionStatus: string | null;
  completionDate: Date | null;
  amenities: Prisma.JsonValue;
  nearbyPlaces: Prisma.JsonValue;
  coverMediaId: string | null;
  createdAt: Date;
  updatedAt: Date;
  buildings: BuildingRow[];
};

type ApartmentRow = {
  id: string;
  projectId: string;
  buildingId: string;
  floorId: string;
  number: string;
  salesStatus: PortalApartmentDetail["salesStatus"];
  publicationStatus: PortalApartmentDetail["publicationStatus"];
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  areaTotal: Prisma.Decimal | null;
  areaLiving: Prisma.Decimal | null;
  balconyArea: Prisma.Decimal | null;
  price: Prisma.Decimal | null;
  priceCurrency: string;
  priceVisibility: PortalApartmentDetail["priceVisibility"];
  description: string | null;
  matterportUrl: string | null;
  external3dUrl: string | null;
  orientation: string | null;
  viewType: string | null;
  features: Prisma.JsonValue;
  planMediaId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const mapPortalProjectListItem = (
  project: ProjectListRow,
): PortalProjectListItem => ({
  id: project.id,
  name: project.name,
  slug: project.slug,
  publicationStatus: project.publicationStatus,
  shortDescription: project.shortDescription,
  locationText: project.locationText,
  city: project.city,
  district: project.district,
  buildingsCount: project._count.buildings,
  apartmentsCount: project._count.apartments,
  createdAt: project.createdAt.toISOString(),
  updatedAt: project.updatedAt.toISOString(),
});

export const mapPortalFloor = (floor: FloorRow): PortalFloorSummary => ({
  id: floor.id,
  buildingId: floor.buildingId,
  number: floor.number,
  publicationStatus: floor.publicationStatus,
  name: floor.name,
  displayLabel: floor.displayLabel,
  displayOrder: floor.displayOrder,
  description: floor.description,
  floorplanMediaId: floor.floorplanMediaId,
  apartmentsCount: floor._count.apartments,
  createdAt: floor.createdAt.toISOString(),
  updatedAt: floor.updatedAt.toISOString(),
});

export const mapPortalBuilding = (
  building: BuildingRow,
): PortalBuildingSummary => ({
  id: building.id,
  projectId: building.projectId,
  name: building.name,
  publicationStatus: building.publicationStatus,
  description: building.description,
  displayOrder: building.displayOrder,
  floorsCount: building.floorsCount,
  coverMediaId: building.coverMediaId,
  floors: building.floors.map(mapPortalFloor),
  createdAt: building.createdAt.toISOString(),
  updatedAt: building.updatedAt.toISOString(),
});

export const mapPortalProjectDetail = (
  project: ProjectDetailRow,
): PortalProjectDetail => ({
  id: project.id,
  builderCompanyId: project.builderCompanyId,
  name: project.name,
  slug: project.slug,
  publicationStatus: project.publicationStatus,
  shortDescription: project.shortDescription,
  fullDescription: project.fullDescription,
  locationText: project.locationText,
  address: project.address,
  city: project.city,
  district: project.district,
  latitude: decimalToString(project.latitude),
  longitude: decimalToString(project.longitude),
  projectType: project.projectType,
  constructionStatus: project.constructionStatus,
  completionDate: dateToIsoDate(project.completionDate),
  amenities: project.amenities,
  nearbyPlaces: project.nearbyPlaces,
  coverMediaId: project.coverMediaId,
  createdAt: project.createdAt.toISOString(),
  updatedAt: project.updatedAt.toISOString(),
  buildings: project.buildings.map(mapPortalBuilding),
});

export const mapPortalApartment = (
  apartment: ApartmentRow,
): PortalApartmentDetail => ({
  id: apartment.id,
  projectId: apartment.projectId,
  buildingId: apartment.buildingId,
  floorId: apartment.floorId,
  number: apartment.number,
  salesStatus: apartment.salesStatus,
  publicationStatus: apartment.publicationStatus,
  rooms: apartment.rooms,
  bedrooms: apartment.bedrooms,
  bathrooms: apartment.bathrooms,
  areaTotal: decimalToString(apartment.areaTotal),
  areaLiving: decimalToString(apartment.areaLiving),
  balconyArea: decimalToString(apartment.balconyArea),
  price: decimalToString(apartment.price),
  priceCurrency: apartment.priceCurrency,
  priceVisibility: apartment.priceVisibility,
  description: apartment.description,
  matterportUrl: apartment.matterportUrl,
  external3dUrl: apartment.external3dUrl,
  orientation: apartment.orientation,
  viewType: apartment.viewType,
  features: apartment.features,
  planMediaId: apartment.planMediaId,
  createdAt: apartment.createdAt.toISOString(),
  updatedAt: apartment.updatedAt.toISOString(),
});
