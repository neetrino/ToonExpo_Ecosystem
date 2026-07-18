import { Injectable } from "@nestjs/common";
import type { BuilderSummary } from "@toonexpo/contracts";
import { CompanyStatus, CompanyType, PublicationStatus } from "@toonexpo/db";

import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class BuildersService {
  constructor(private readonly prisma: PrismaService) {}

  async listBuilders(): Promise<BuilderSummary[]> {
    const builders = await this.prisma.db.company.findMany({
      where: {
        type: CompanyType.builder,
        status: CompanyStatus.active,
      },
      orderBy: { name: "asc" },
      include: {
        logoMedia: true,
        _count: {
          select: {
            projects: {
              where: { publicationStatus: PublicationStatus.published },
            },
          },
        },
      },
    });

    return builders.map((builder) => ({
      id: builder.id,
      name: builder.name,
      logoUrl: builder.logoMedia?.fileUrl ?? null,
      publishedProjectCount: builder._count.projects,
    }));
  }
}
