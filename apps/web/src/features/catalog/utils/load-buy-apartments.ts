import type { FloorApartmentSummary, PriceVisibility, ProjectDetail } from '@toonexpo/contracts';

import { getProject, listProjects } from '@/features/catalog/api/catalog-api';
import type { ProjectFilterParams } from '@/features/catalog/utils/project-filters';
import { toListProjectsQuery } from '@/features/catalog/utils/project-filters';

const BUY_PROJECT_FETCH_LIMIT = 8;
const BUY_APARTMENT_LIMIT = 24;

export type BuyApartmentListing = {
  id: string;
  title: string;
  rooms: number | null;
  areaTotal: string | null;
  price: string | null;
  priceCurrency: string;
  priceVisibility: PriceVisibility;
  salesStatus: FloorApartmentSummary['salesStatus'];
  locationLine: string | null;
  image: { src: string; alt: string } | null;
  latitude: number | null;
  longitude: number | null;
  projectId: string;
  projectName: string;
};

/**
 * Builds Buy-page apartment cards from published project inventories.
 */
export const loadBuyApartmentListings = async (options: {
  locale: string;
  filters: ProjectFilterParams;
}): Promise<BuyApartmentListing[]> => {
  const { locale, filters } = options;
  const projects = await listProjects(
    {
      ...toListProjectsQuery({
        ...filters,
        page: 1,
        pageSize: BUY_PROJECT_FETCH_LIMIT,
      }),
    },
    { locale },
  );

  const details = (
    await Promise.all(projects.data.map((project) => getProject(project.id, { locale })))
  ).filter((project): project is ProjectDetail => project != null);

  const listings: BuyApartmentListing[] = [];

  for (const project of details) {
    for (const building of project.buildings) {
      for (const floor of building.floors) {
        for (const apartment of floor.apartments) {
          if (filters.salesStatus && apartment.salesStatus !== filters.salesStatus) {
            continue;
          }
          if (!filters.salesStatus && apartment.salesStatus !== 'available') {
            continue;
          }
          if (filters.rooms != null) {
            if (apartment.rooms == null) {
              continue;
            }
            if (filters.rooms >= 4) {
              if (apartment.rooms < 4) {
                continue;
              }
            } else if (apartment.rooms !== filters.rooms) {
              continue;
            }
          }
          if (filters.minPrice != null && apartment.price != null) {
            if (Number(apartment.price) < filters.minPrice) {
              continue;
            }
          }
          if (filters.maxPrice != null && apartment.price != null) {
            if (Number(apartment.price) > filters.maxPrice) {
              continue;
            }
          }

          listings.push(toListing(apartment, project));
          if (listings.length >= BUY_APARTMENT_LIMIT) {
            return listings;
          }
        }
      }
    }
  }

  return listings;
};

const toListing = (
  apartment: FloorApartmentSummary,
  project: ProjectDetail,
): BuyApartmentListing => {
  const district = project.district?.trim() || null;
  const city = project.city?.trim() || null;
  const locationLine =
    district && city
      ? `${district} · ${city}`
      : project.locationText?.trim() || city || district || null;

  return {
    id: apartment.id,
    title: apartment.number,
    rooms: apartment.rooms,
    areaTotal: apartment.areaTotal,
    price: apartment.price,
    priceCurrency: apartment.priceCurrency,
    priceVisibility: apartment.priceVisibility,
    salesStatus: apartment.salesStatus,
    locationLine,
    image: project.cover
      ? {
          src: project.cover.fileUrl,
          alt: project.cover.altText ?? project.name,
        }
      : null,
    latitude: toCoord(project.latitude),
    longitude: toCoord(project.longitude),
    projectId: project.id,
    projectName: project.name,
  };
};

const toCoord = (value: string | null): number | null => {
  if (value == null || value.trim() === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};
