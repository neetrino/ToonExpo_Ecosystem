import { Inject, Injectable } from '@nestjs/common';
import type { PublicBuilderDetail, PublicBuilderSummary } from '@toonexpo/contracts';

import { PrismaService } from '../../common/prisma.service';
import { mapBuilderDetail, mapBuilderSummary } from './catalog.mapper';
import { projectSummarySelect } from './catalog-projects.service';

const publishedProjectWhere = { status: 'PUBLISHED' as const };

const builderSummarySelect = {
  id: true,
  name: true,
  slug: true,
  logoUrl: true,
  city: true,
  description: true,
  _count: {
    select: {
      projects: { where: publishedProjectWhere },
    },
  },
} as const;

@Injectable()
export class CatalogBuildersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list(): Promise<PublicBuilderSummary[]> {
    const rows = await this.prisma.client.company.findMany({
      where: { projects: { some: publishedProjectWhere } },
      orderBy: { name: 'asc' },
      select: builderSummarySelect,
    });
    return rows.map(mapBuilderSummary);
  }

  async detail(slug: string): Promise<PublicBuilderDetail | null> {
    const row = await this.prisma.client.company.findFirst({
      where: { slug, projects: { some: publishedProjectWhere } },
      select: {
        ...builderSummarySelect,
        phone: true,
        email: true,
        website: true,
        address: true,
        projects: {
          where: publishedProjectWhere,
          orderBy: { createdAt: 'desc' },
          select: projectSummarySelect,
        },
      },
    });
    return row ? mapBuilderDetail(row) : null;
  }
}
