import { BadRequestException, Injectable } from '@nestjs/common';
import type { PortalProjectDetail, PortalProjectListResponse } from '@toonexpo/contracts';
import { PublicationStatus, type Prisma } from '@toonexpo/db';

import { loadTranslations } from '../../catalog/utils/load-translations.js';
import { TRANSLATION_ENTITY, TRANSLATION_FIELD } from '../../catalog/utils/resolve-translation.js';
import { WebRevalidationService } from '../../common/web-revalidation/web-revalidation.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { mapPortalProjectDetail, mapPortalProjectListItem } from '../mappers/portal.mapper.js';
import { PORTAL_DEFAULT_PAGE_SIZE } from '../portal.constants.js';
import { entityNotFound } from '../utils/access.js';
import { groupPortalTranslations } from '../utils/group-translations.js';
import { requireOwnedProject } from '../utils/ownership.js';
import { buildProjectSlug } from '../utils/slug.js';
import { upsertTranslations } from '../utils/upsert-translations.js';
import type { CreatePortalProjectDto } from '../dto/create-portal-project.dto.js';
import type { UpdatePortalProjectDto } from '../dto/update-portal-project.dto.js';
import type { UpdatePortalPublicationDto } from '../dto/update-portal-publication.dto.js';

const PROJECT_TRANSLATION_FIELDS = [
  TRANSLATION_FIELD.name,
  TRANSLATION_FIELD.shortDescription,
  TRANSLATION_FIELD.fullDescription,
  TRANSLATION_FIELD.locationText,
] as const;

const projectDetailInclude = {
  buildings: {
    orderBy: [{ displayOrder: 'asc' as const }, { name: 'asc' as const }],
    include: {
      floors: {
        orderBy: [{ displayOrder: 'asc' as const }, { number: 'asc' as const }],
        include: { _count: { select: { apartments: true } } },
      },
    },
  },
} satisfies Prisma.ProjectInclude;

@Injectable()
export class PortalProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly webRevalidation: WebRevalidationService,
  ) {}

  async list(
    companyId: string,
    page: number,
    pageSize = PORTAL_DEFAULT_PAGE_SIZE,
  ): Promise<PortalProjectListResponse> {
    const where: Prisma.ProjectWhereInput = {
      builderCompanyId: companyId,
    };

    const [total, projects] = await Promise.all([
      this.prisma.db.project.count({ where }),
      this.prisma.db.project.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          _count: { select: { buildings: true, apartments: true } },
        },
      }),
    ]);

    return {
      data: projects.map((project) => mapPortalProjectListItem(project)),
      meta: {
        page,
        pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
      },
    };
  }

  async getById(companyId: string, projectId: string): Promise<PortalProjectDetail> {
    const project = await this.prisma.db.project.findFirst({
      where: { id: projectId, builderCompanyId: companyId },
      include: projectDetailInclude,
    });
    if (!project) {
      throw entityNotFound('Project');
    }
    return this.toProjectDetail(project);
  }

  async create(
    companyId: string,
    userId: string,
    dto: CreatePortalProjectDto,
  ): Promise<PortalProjectDetail> {
    const slug = dto.slug?.trim() || buildProjectSlug(dto.name);
    const project = await this.prisma.db.project.create({
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
      },
      include: projectDetailInclude,
    });

    if (dto.translations) {
      await upsertTranslations(this.prisma.db, {
        entityType: TRANSLATION_ENTITY.project,
        entityId: project.id,
        fields: {
          [TRANSLATION_FIELD.name]: dto.translations.name,
          [TRANSLATION_FIELD.shortDescription]: dto.translations.shortDescription,
          [TRANSLATION_FIELD.fullDescription]: dto.translations.fullDescription,
          [TRANSLATION_FIELD.locationText]: dto.translations.locationText,
        },
        updatedByUserId: userId,
      });
    }

    return this.toProjectDetail(project);
  }

  async update(
    companyId: string,
    userId: string,
    projectId: string,
    dto: UpdatePortalProjectDto,
  ): Promise<PortalProjectDetail> {
    await requireOwnedProject(this.prisma, projectId, companyId);

    const project = await this.prisma.db.project.update({
      where: { id: projectId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
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
          ? {
              completionDate: dto.completionDate === null ? null : new Date(dto.completionDate),
            }
          : {}),
        ...(dto.amenities !== undefined
          ? { amenities: dto.amenities as Prisma.InputJsonValue }
          : {}),
        ...(dto.nearbyPlaces !== undefined
          ? { nearbyPlaces: dto.nearbyPlaces as Prisma.InputJsonValue }
          : {}),
        ...(dto.coverMediaId !== undefined ? { coverMediaId: dto.coverMediaId } : {}),
        updatedByUserId: userId,
      },
      include: projectDetailInclude,
    });

    if (dto.translations) {
      await upsertTranslations(this.prisma.db, {
        entityType: TRANSLATION_ENTITY.project,
        entityId: project.id,
        fields: {
          [TRANSLATION_FIELD.name]: dto.translations.name,
          [TRANSLATION_FIELD.shortDescription]: dto.translations.shortDescription,
          [TRANSLATION_FIELD.fullDescription]: dto.translations.fullDescription,
          [TRANSLATION_FIELD.locationText]: dto.translations.locationText,
        },
        updatedByUserId: userId,
      });
    }

    return this.toProjectDetail(project);
  }

  async updatePublication(
    companyId: string,
    userId: string,
    projectId: string,
    dto: UpdatePortalPublicationDto,
  ): Promise<PortalProjectDetail> {
    await requireOwnedProject(this.prisma, projectId, companyId);

    const project = await this.prisma.db.project.update({
      where: { id: projectId },
      data: {
        publicationStatus: dto.publicationStatus as PublicationStatus,
        updatedByUserId: userId,
      },
      include: projectDetailInclude,
    });

    this.webRevalidation.revalidateCatalog(projectId);
    return this.toProjectDetail(project);
  }

  async remove(companyId: string, projectId: string): Promise<void> {
    const project = await this.prisma.db.project.findFirst({
      where: { id: projectId, builderCompanyId: companyId },
      select: { id: true, publicationStatus: true },
    });
    if (!project) {
      throw entityNotFound('Project');
    }
    if (project.publicationStatus !== PublicationStatus.draft) {
      throw new BadRequestException('Only draft projects can be deleted');
    }
    await this.prisma.db.project.delete({ where: { id: projectId } });
  }

  private async toProjectDetail(
    project: Prisma.ProjectGetPayload<{ include: typeof projectDetailInclude }>,
  ): Promise<PortalProjectDetail> {
    const rows = await loadTranslations(this.prisma.db, TRANSLATION_ENTITY.project, [project.id]);
    const translations = groupPortalTranslations(rows, PROJECT_TRANSLATION_FIELDS);
    return mapPortalProjectDetail(project, translations);
  }
}
