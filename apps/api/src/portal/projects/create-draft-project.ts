import { PublicationStatus, type Prisma } from '@toonexpo/db';

import type { PrismaService } from '../../prisma/prisma.service.js';
import type { CreatePortalProjectDto } from '../dto/create-portal-project.dto.js';
import { projectDetailInclude } from './project-detail.include.js';
import { insertProjectWithUniqueSlug, projectSlugBase } from './project-slug.js';

type DraftProject = Prisma.ProjectGetPayload<{ include: typeof projectDetailInclude }>;

/**
 * Inserts a draft project, appending `-2`, `-3` when the slug is already taken.
 */
export const createDraftProject = (
  db: PrismaService['db'],
  companyId: string,
  userId: string,
  dto: CreatePortalProjectDto,
): Promise<DraftProject> =>
  insertProjectWithUniqueSlug(db, projectSlugBase(dto.slug, dto.name), (slug) =>
    db.project.create({
      data: {
        builderCompanyId: companyId,
        name: dto.name,
        slug,
        publicationStatus: PublicationStatus.draft,
        createdByUserId: userId,
        updatedByUserId: userId,
        ...(dto.shortDescription !== undefined ? { shortDescription: dto.shortDescription } : {}),
        ...(dto.fullDescription !== undefined ? { fullDescription: dto.fullDescription } : {}),
        ...(dto.locationText !== undefined ? { locationText: dto.locationText } : {}),
        ...(dto.address !== undefined ? { address: dto.address } : {}),
        ...(dto.city !== undefined ? { city: dto.city } : {}),
        ...(dto.district !== undefined ? { district: dto.district } : {}),
        ...(dto.latitude !== undefined ? { latitude: dto.latitude } : {}),
        ...(dto.longitude !== undefined ? { longitude: dto.longitude } : {}),
        ...(dto.projectType !== undefined ? { projectType: dto.projectType } : {}),
        ...(dto.constructionStatus !== undefined
          ? { constructionStatus: dto.constructionStatus }
          : {}),
        ...(dto.completionDate !== undefined
          ? { completionDate: new Date(dto.completionDate) }
          : {}),
        ...(dto.amenities !== undefined
          ? { amenities: dto.amenities as Prisma.InputJsonValue }
          : {}),
        ...(dto.nearbyPlaces !== undefined
          ? { nearbyPlaces: dto.nearbyPlaces as Prisma.InputJsonValue }
          : {}),
        ...(dto.coverMediaId !== undefined ? { coverMediaId: dto.coverMediaId } : {}),
        ...(dto.verified !== undefined ? { verified: dto.verified } : {}),
      },
      include: projectDetailInclude,
    }),
  );
