import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { FeaturedOnHomeResponse } from '@toonexpo/contracts';

import {
  HOME_FEATURED_APARTMENT_LIMIT,
  HOME_FEATURED_PROJECT_LIMIT,
} from '../../catalog/catalog.constants.js';
import { WebRevalidationService } from '../../common/web-revalidation/web-revalidation.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

/**
 * Admin pin/unpin for homepage curated projects and apartments.
 */
@Injectable()
export class AdminHomeFeaturedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly webRevalidation: WebRevalidationService,
  ) {}

  /**
   * Pins or unpins a project on the public homepage (max 3 platform-wide).
   */
  async setProjectFeaturedOnHome(
    projectId: string,
    featuredOnHome: boolean,
  ): Promise<FeaturedOnHomeResponse> {
    const project = await this.prisma.db.project.findUnique({
      where: { id: projectId },
      select: { id: true, featuredOnHome: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (featuredOnHome && !project.featuredOnHome) {
      const featuredCount = await this.prisma.db.project.count({
        where: { featuredOnHome: true },
      });
      if (featuredCount >= HOME_FEATURED_PROJECT_LIMIT) {
        throw new ConflictException(
          `Homepage already has ${HOME_FEATURED_PROJECT_LIMIT} featured projects`,
        );
      }
    }

    const updated = await this.prisma.db.project.update({
      where: { id: projectId },
      data: { featuredOnHome },
      select: { id: true, featuredOnHome: true },
    });

    this.webRevalidation.revalidateCatalog(projectId);
    return { id: updated.id, featuredOnHome: updated.featuredOnHome };
  }

  /**
   * Pins or unpins an apartment on the public homepage (max 6 platform-wide).
   */
  async setApartmentFeaturedOnHome(
    apartmentId: string,
    featuredOnHome: boolean,
  ): Promise<FeaturedOnHomeResponse> {
    const apartment = await this.prisma.db.apartment.findUnique({
      where: { id: apartmentId },
      select: { id: true, featuredOnHome: true, projectId: true },
    });
    if (!apartment) {
      throw new NotFoundException('Apartment not found');
    }

    if (featuredOnHome && !apartment.featuredOnHome) {
      const featuredCount = await this.prisma.db.apartment.count({
        where: { featuredOnHome: true },
      });
      if (featuredCount >= HOME_FEATURED_APARTMENT_LIMIT) {
        throw new ConflictException(
          `Homepage already has ${HOME_FEATURED_APARTMENT_LIMIT} featured apartments`,
        );
      }
    }

    const updated = await this.prisma.db.apartment.update({
      where: { id: apartmentId },
      data: { featuredOnHome },
      select: { id: true, featuredOnHome: true },
    });

    this.webRevalidation.revalidateCatalog(apartment.projectId);
    return { id: updated.id, featuredOnHome: updated.featuredOnHome };
  }
}
