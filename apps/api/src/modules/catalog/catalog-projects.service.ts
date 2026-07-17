import { Inject, Injectable } from '@nestjs/common';
import type {
  PublicApartmentDetail,
  PublicProjectDetail,
  PublicProjectSummary,
} from '@toonexpo/contracts';

import { PrismaService } from '../../common/prisma.service';
import {
  mapApartmentDetail,
  mapProjectDetail,
  mapProjectSummary,
} from './catalog.mapper';

export const APARTMENT_ID_PATTERN = /^c[a-z0-9]{20,32}$/i;

export type PublishedProjectFilters = {
  city?: string;
  builderSlug?: string;
};

export type PublishedProjectLoad = {
  project: PublicProjectDetail;
  companyId: string;
};

const projectSummarySelect = {
  id: true,
  slug: true,
  name: true,
  city: true,
  company: { select: { slug: true, name: true } },
  media: {
    orderBy: { sortOrder: 'asc' as const },
    take: 1,
    select: { url: true },
  },
} as const;

const apartmentPublicSelect = {
  id: true,
  code: true,
  status: true,
  areaSqm: true,
  rooms: true,
  priceAmd: true,
  priceVisibility: true,
} as const;

@Injectable()
export class CatalogProjectsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list(filters: PublishedProjectFilters): Promise<PublicProjectSummary[]> {
    const rows = await this.prisma.client.project.findMany({
      where: {
        status: 'PUBLISHED',
        ...(filters.city
          ? { city: { contains: filters.city, mode: 'insensitive' as const } }
          : {}),
        ...(filters.builderSlug ? { company: { slug: filters.builderSlug } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: projectSummarySelect,
    });
    return rows.map(mapProjectSummary);
  }

  async detail(
    companySlug: string,
    projectSlug: string,
    authenticated: boolean,
  ): Promise<PublishedProjectLoad | null> {
    const row = await this.prisma.client.project.findFirst({
      where: {
        slug: projectSlug,
        status: 'PUBLISHED',
        company: { slug: companySlug },
      },
      select: {
        id: true,
        companyId: true,
        slug: true,
        name: true,
        city: true,
        description: true,
        address: true,
        company: {
          select: {
            slug: true,
            name: true,
            description: true,
            logoUrl: true,
            phone: true,
            email: true,
            website: true,
            city: true,
            address: true,
          },
        },
        media: {
          orderBy: { sortOrder: 'asc' },
          select: { id: true, url: true, alt: true },
        },
        buildings: {
          where: { status: 'PUBLISHED' },
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            description: true,
            floors: {
              where: { status: 'PUBLISHED' },
              orderBy: { level: 'asc' },
              select: {
                id: true,
                name: true,
                level: true,
                apartments: {
                  orderBy: { code: 'asc' },
                  select: apartmentPublicSelect,
                },
              },
            },
          },
        },
      },
    });

    if (!row) {
      return null;
    }
    return {
      project: mapProjectDetail(row, authenticated),
      companyId: row.companyId,
    };
  }

  async apartment(
    companySlug: string,
    projectSlug: string,
    apartmentId: string,
    authenticated: boolean,
  ): Promise<PublicApartmentDetail | null> {
    if (!APARTMENT_ID_PATTERN.test(apartmentId)) {
      return null;
    }
    const row = await this.prisma.client.apartment.findFirst({
      where: {
        id: apartmentId,
        floor: {
          status: 'PUBLISHED',
          building: {
            status: 'PUBLISHED',
            project: {
              slug: projectSlug,
              status: 'PUBLISHED',
              company: { slug: companySlug },
            },
          },
        },
      },
      select: {
        ...apartmentPublicSelect,
        matterportUrl: true,
        media: {
          orderBy: { sortOrder: 'asc' },
          select: { id: true, url: true, alt: true },
        },
        floor: {
          select: {
            name: true,
            building: {
              select: {
                name: true,
                project: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    companyId: true,
                    company: { select: { slug: true, name: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    return row ? mapApartmentDetail(row, authenticated) : null;
  }
}

export { projectSummarySelect };
