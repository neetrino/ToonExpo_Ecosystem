import type { FloorApartmentSummary, PriceVisibility, ProjectDetail } from '@toonexpo/contracts';

import { getProject, listProjects } from '@/features/catalog/api/catalog-api';
import {
  DISCOVER_APARTMENT_LIMIT,
  DISCOVER_PROJECT_FETCH_LIMIT,
} from '@/features/discover/constants';

export type DiscoverApartmentCard = {
  id: string;
  number: string;
  rooms: number | null;
  areaTotal: string | null;
  price: string | null;
  priceCurrency: string;
  priceVisibility: PriceVisibility;
  locationLine: string | null;
  image: { src: string; alt: string } | null;
  projectId: string;
  projectName: string;
  builderName: string;
};

/**
 * Available apartments for the discover swipe deck (from published projects).
 */
export const loadDiscoverApartments = async (locale: string): Promise<DiscoverApartmentCard[]> => {
  const projects = await listProjects(
    { page: 1, pageSize: DISCOVER_PROJECT_FETCH_LIMIT, locale },
    { locale },
  );

  const details = (
    await Promise.all(projects.data.map((project) => getProject(project.id, { locale })))
  ).filter((project): project is ProjectDetail => project != null);

  const listings: DiscoverApartmentCard[] = [];

  for (const project of details) {
    for (const building of project.buildings) {
      for (const floor of building.floors) {
        for (const apartment of floor.apartments) {
          if (apartment.salesStatus !== 'available') {
            continue;
          }

          listings.push(toCard(apartment, project));
          if (listings.length >= DISCOVER_APARTMENT_LIMIT) {
            return listings;
          }
        }
      }
    }
  }

  return listings;
};

const toCard = (
  apartment: FloorApartmentSummary,
  project: ProjectDetail,
): DiscoverApartmentCard => {
  const district = project.district?.trim() || null;
  const city = project.city?.trim() || null;
  const locationLine =
    district && city
      ? `${district} · ${city}`
      : project.locationText?.trim() || city || district || null;

  return {
    id: apartment.id,
    number: apartment.number,
    rooms: apartment.rooms,
    areaTotal: apartment.areaTotal,
    price: apartment.price,
    priceCurrency: apartment.priceCurrency,
    priceVisibility: apartment.priceVisibility,
    locationLine,
    image: project.cover
      ? {
          src: project.cover.fileUrl,
          alt: project.cover.altText ?? project.name,
        }
      : null,
    projectId: project.id,
    projectName: project.name,
    builderName: project.builder.name,
  };
};
