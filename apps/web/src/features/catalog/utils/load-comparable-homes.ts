import type { ApartmentDetail, ProjectDetail } from '@toonexpo/contracts';

import type { ComparableHomeCardModel } from '@/features/catalog/components/comparable-home-card';
import { getApartment } from '@/features/catalog/api/catalog-api';

const COMPARABLE_HOMES_LIMIT = 3;

/**
 * Loads up to three other available units in the same project for Comparable homes.
 */
export const loadComparableHomes = async (options: {
  project: ProjectDetail;
  currentApartmentId: string;
  locale: string;
  locationLine: string | null;
}): Promise<ComparableHomeCardModel[]> => {
  const { project, currentApartmentId, locale, locationLine } = options;
  const candidateIds = collectComparableApartmentIds(project, currentApartmentId);
  const fallbackLocation = locationLine ?? buildProjectLocation(project);

  const apartments = (
    await Promise.all(candidateIds.map((id) => getApartment(id, { locale })))
  ).filter((apartment): apartment is ApartmentDetail => apartment != null);

  return apartments.map((apartment) => toComparableHomeCard(apartment, project, fallbackLocation));
};

const collectComparableApartmentIds = (
  project: ProjectDetail,
  currentApartmentId: string,
): string[] => {
  const ids: string[] = [];

  for (const building of project.buildings) {
    for (const floor of building.floors) {
      for (const apartment of floor.apartments) {
        if (apartment.id === currentApartmentId) {
          continue;
        }
        if (apartment.salesStatus !== 'available') {
          continue;
        }
        ids.push(apartment.id);
        if (ids.length >= COMPARABLE_HOMES_LIMIT) {
          return ids;
        }
      }
    }
  }

  return ids;
};

const toComparableHomeCard = (
  apartment: ApartmentDetail,
  project: ProjectDetail,
  locationLine: string | null,
): ComparableHomeCardModel => {
  const image = apartment.plan
    ? {
        src: apartment.plan.fileUrl,
        alt: apartment.plan.altText ?? apartment.number,
      }
    : project.cover
      ? {
          src: project.cover.fileUrl,
          alt: project.cover.altText ?? project.name,
        }
      : null;

  return {
    id: apartment.id,
    title: apartment.number,
    locationLine,
    bedrooms: apartment.bedrooms ?? apartment.rooms,
    bathrooms: apartment.bathrooms,
    areaTotal: apartment.areaTotal,
    price: apartment.price,
    priceCurrency: apartment.priceCurrency,
    priceVisibility: apartment.priceVisibility,
    image,
  };
};

const buildProjectLocation = (project: ProjectDetail): string | null => {
  const district = project.district?.trim() || null;
  const city = project.city?.trim() || null;
  if (district && city) {
    return `${district} · ${city}`;
  }
  return project.locationText?.trim() || city || district || null;
};
