import { Injectable } from '@nestjs/common';
import type { PublicGeoMapModelListResponse } from '@toonexpo/contracts';
import type { Prisma } from '@toonexpo/db';

import { PrismaService } from '../../prisma/prisma.service.js';
import { toPublicGeoMapModelItem } from '../mappers/geo-map.mapper.js';

const publicInclude = {
  project: {
    select: {
      id: true,
      name: true,
      slug: true,
      builderCompany: { select: { logoMedia: { select: { fileUrl: true } } } },
    },
  },
  mediaAsset: { select: { fileUrl: true } },
} satisfies Prisma.ProjectMapModelInclude;

@Injectable()
export class PublicGeoMapService {
  constructor(private readonly prisma: PrismaService) {}

  buildPublishedWhere(): Prisma.ProjectMapModelWhereInput {
    return { isPublished: true };
  }

  async listPublished(): Promise<PublicGeoMapModelListResponse> {
    const rows = await this.prisma.db.projectMapModel.findMany({
      where: this.buildPublishedWhere(),
      include: publicInclude,
      orderBy: [{ project: { name: 'asc' } }],
    });

    return { data: rows.map(toPublicGeoMapModelItem) };
  }
}
