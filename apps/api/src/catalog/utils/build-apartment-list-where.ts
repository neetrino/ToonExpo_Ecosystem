import { ApartmentSalesStatus, type Prisma } from '@toonexpo/db';

import { PUBLIC_PUBLICATION_STATUS } from '../catalog.constants.js';
import type { ListApartmentsQueryDto } from '../dto/list-apartments.query.dto.js';
import { buildRoomsFilter } from './rooms-filter.js';

/**
 * Builds Prisma where for public apartment list filters.
 */
export const buildApartmentListWhere = (
  query: ListApartmentsQueryDto,
): Prisma.ApartmentWhereInput => {
  const projectWhere: Prisma.ProjectWhereInput = {
    publicationStatus: PUBLIC_PUBLICATION_STATUS,
  };

  if (query.builderId) {
    projectWhere.builderCompanyId = query.builderId;
  }

  if (query.city) {
    const cities = query.city
      .split(',')
      .map((city) => city.trim())
      .filter((city) => city.length > 0);
    const [firstCity] = cities;
    if (cities.length === 1 && firstCity != null) {
      projectWhere.city = { equals: firstCity, mode: 'insensitive' };
    } else if (cities.length > 1) {
      projectWhere.OR = cities.map((city) => ({
        city: { equals: city, mode: 'insensitive' as const },
      }));
    }
  }

  const where: Prisma.ApartmentWhereInput = {
    publicationStatus: PUBLIC_PUBLICATION_STATUS,
    project: projectWhere,
    building: { publicationStatus: PUBLIC_PUBLICATION_STATUS },
    floor: { publicationStatus: PUBLIC_PUBLICATION_STATUS },
    ...(query.featuredOnHome === true ? { featuredOnHome: true } : {}),
  };

  if (query.salesStatus) {
    where.salesStatus = query.salesStatus as ApartmentSalesStatus;
  }

  if (query.rooms != null && query.rooms.length > 0) {
    Object.assign(where, buildRoomsFilter(query.rooms));
  }

  if (query.minPrice != null || query.maxPrice != null) {
    where.price = {};
    if (query.minPrice != null) {
      where.price.gte = query.minPrice;
    }
    if (query.maxPrice != null) {
      where.price.lte = query.maxPrice;
    }
    where.priceVisibility = 'public';
    where.building = {
      publicationStatus: PUBLIC_PUBLICATION_STATUS,
      priceOnRequestEnabled: false,
    };
    projectWhere.priceOnRequestEnabled = false;
  }

  const keyword = query.q?.trim();
  if (keyword != null && keyword.length > 0) {
    where.AND = [
      {
        OR: [
          { number: { contains: keyword, mode: 'insensitive' } },
          {
            project: {
              OR: [
                { name: { contains: keyword, mode: 'insensitive' } },
                { city: { contains: keyword, mode: 'insensitive' } },
                { district: { contains: keyword, mode: 'insensitive' } },
                { locationText: { contains: keyword, mode: 'insensitive' } },
                { builderCompany: { name: { contains: keyword, mode: 'insensitive' } } },
              ],
            },
          },
        ],
      },
    ];
  }

  return where;
};
