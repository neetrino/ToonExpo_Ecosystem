import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type {
  AdminHomeHero,
  AdminSitePagesResponse,
  HomeHeroCopy,
  HomeHeroSlide,
  PublicHomeHero,
  PublicSitePages,
  PublicSitePagesResponse,
  UpdateHomeHeroRequest,
  UpdatePublicSitePagesRequest,
} from '@toonexpo/contracts';
import { MediaAssetType } from '@toonexpo/db';

import {
  PUBLIC_CACHE_TAG,
  WebRevalidationService,
} from '../common/web-revalidation/web-revalidation.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  HOME_HERO_MAX_SLIDES,
  PLATFORM_SETTING_HOME_HERO_COPY,
  PLATFORM_SETTING_HOME_HERO_COPY_DESCRIPTION,
  PLATFORM_SETTING_HOME_HERO_DESCRIPTION,
  PLATFORM_SETTING_HOME_HERO_MEDIA_ID,
  PLATFORM_SETTING_HOME_HERO_SLIDES,
  PLATFORM_SETTING_PUBLIC_SITE_PAGES,
  PLATFORM_SETTING_PUBLIC_SITE_PAGES_DESCRIPTION,
} from './platform-settings.constants.js';
import {
  isHomeHeroCopyEmpty,
  normalizeHomeHeroCopy,
  parseHomeHeroCopy,
} from './utils/home-hero-copy.js';
import { normalizePublicSitePages, parsePublicSitePages } from './utils/public-site-pages.js';

/**
 * Reads/writes platform settings used by public surfaces (home hero, pages, etc.).
 */
@Injectable()
export class PlatformSettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly webRevalidation: WebRevalidationService,
  ) {}

  getPublicHomeHero(): Promise<PublicHomeHero> {
    return this.resolveHomeHero();
  }

  async getAdminHomeHero(): Promise<AdminHomeHero> {
    const [{ ids, updatedAt }, copy] = await Promise.all([
      this.readStoredSlideIds(),
      this.readStoredCopy(),
    ]);
    const slides = await this.resolveSlides(ids);
    return { slides, ...copy, updatedAt };
  }

  async updateHomeHero(
    body: UpdateHomeHeroRequest,
    updatedByUserId: string,
  ): Promise<AdminHomeHero> {
    await this.applySlideUpdate(body.mediaAssetIds, updatedByUserId);
    if (body.title !== undefined || body.subtitle !== undefined) {
      await this.upsertCopy(
        {
          title: body.title ?? {},
          subtitle: body.subtitle ?? {},
        },
        updatedByUserId,
      );
    }
    this.revalidateHome();
    return this.getAdminHomeHero();
  }

  async getPublicSitePages(): Promise<PublicSitePagesResponse> {
    const pages = await this.readStoredPublicSitePages();
    return { pages };
  }

  async getAdminSitePages(): Promise<AdminSitePagesResponse> {
    const row = await this.prisma.db.platformSetting.findUnique({
      where: { key: PLATFORM_SETTING_PUBLIC_SITE_PAGES },
      select: { value: true, updatedAt: true },
    });
    return {
      pages: parsePublicSitePages(row?.value),
      updatedAt: row?.updatedAt.toISOString() ?? null,
    };
  }

  async updatePublicSitePages(
    body: UpdatePublicSitePagesRequest,
    updatedByUserId: string,
  ): Promise<AdminSitePagesResponse> {
    const pages = normalizePublicSitePages(body.pages);
    await this.prisma.db.platformSetting.upsert({
      where: { key: PLATFORM_SETTING_PUBLIC_SITE_PAGES },
      create: {
        key: PLATFORM_SETTING_PUBLIC_SITE_PAGES,
        value: JSON.stringify(pages),
        valueType: 'json',
        description: PLATFORM_SETTING_PUBLIC_SITE_PAGES_DESCRIPTION,
        updatedByUserId,
      },
      update: {
        value: JSON.stringify(pages),
        valueType: 'json',
        description: PLATFORM_SETTING_PUBLIC_SITE_PAGES_DESCRIPTION,
        updatedByUserId,
      },
    });
    this.revalidatePublicPages();
    return this.getAdminSitePages();
  }

  private async readStoredPublicSitePages(): Promise<PublicSitePages> {
    const row = await this.prisma.db.platformSetting.findUnique({
      where: { key: PLATFORM_SETTING_PUBLIC_SITE_PAGES },
      select: { value: true },
    });
    return parsePublicSitePages(row?.value);
  }

  private async resolveHomeHero(): Promise<PublicHomeHero> {
    const [{ ids }, copy] = await Promise.all([this.readStoredSlideIds(), this.readStoredCopy()]);
    const slides = await this.resolveSlides(ids);
    return { slides, ...copy };
  }

  private async applySlideUpdate(
    mediaAssetIds: string[] | null,
    updatedByUserId: string,
  ): Promise<void> {
    if (mediaAssetIds === null || mediaAssetIds.length === 0) {
      await this.prisma.db.platformSetting.deleteMany({
        where: {
          key: {
            in: [PLATFORM_SETTING_HOME_HERO_SLIDES, PLATFORM_SETTING_HOME_HERO_MEDIA_ID],
          },
        },
      });
      return;
    }

    const uniqueIds = uniqueMediaIds(mediaAssetIds);
    if (uniqueIds.length !== mediaAssetIds.length) {
      throw new BadRequestException('mediaAssetIds must be non-empty and unique');
    }
    if (uniqueIds.length > HOME_HERO_MAX_SLIDES) {
      throw new BadRequestException(`At most ${HOME_HERO_MAX_SLIDES} hero slides are allowed`);
    }

    const slides = await this.resolveSlides(uniqueIds);
    if (slides.length !== uniqueIds.length) {
      throw new NotFoundException('One or more media assets were not found');
    }

    const value = JSON.stringify(uniqueIds);
    await this.prisma.db.platformSetting.upsert({
      where: { key: PLATFORM_SETTING_HOME_HERO_SLIDES },
      create: {
        key: PLATFORM_SETTING_HOME_HERO_SLIDES,
        value,
        valueType: 'json',
        description: PLATFORM_SETTING_HOME_HERO_DESCRIPTION,
        updatedByUserId,
      },
      update: {
        value,
        valueType: 'json',
        description: PLATFORM_SETTING_HOME_HERO_DESCRIPTION,
        updatedByUserId,
      },
    });

    await this.prisma.db.platformSetting.deleteMany({
      where: { key: PLATFORM_SETTING_HOME_HERO_MEDIA_ID },
    });
  }

  private async upsertCopy(copy: HomeHeroCopy, updatedByUserId: string): Promise<void> {
    const next = normalizeHomeHeroCopy(copy);
    if (isHomeHeroCopyEmpty(next)) {
      await this.prisma.db.platformSetting.deleteMany({
        where: { key: PLATFORM_SETTING_HOME_HERO_COPY },
      });
      return;
    }

    const value = JSON.stringify(next);
    await this.prisma.db.platformSetting.upsert({
      where: { key: PLATFORM_SETTING_HOME_HERO_COPY },
      create: {
        key: PLATFORM_SETTING_HOME_HERO_COPY,
        value,
        valueType: 'json',
        description: PLATFORM_SETTING_HOME_HERO_COPY_DESCRIPTION,
        updatedByUserId,
      },
      update: {
        value,
        valueType: 'json',
        description: PLATFORM_SETTING_HOME_HERO_COPY_DESCRIPTION,
        updatedByUserId,
      },
    });
  }

  private async readStoredCopy(): Promise<HomeHeroCopy> {
    const row = await this.prisma.db.platformSetting.findUnique({
      where: { key: PLATFORM_SETTING_HOME_HERO_COPY },
      select: { value: true },
    });
    return parseHomeHeroCopy(row?.value);
  }

  private async readStoredSlideIds(): Promise<{ ids: string[]; updatedAt: string | null }> {
    const row = await this.prisma.db.platformSetting.findUnique({
      where: { key: PLATFORM_SETTING_HOME_HERO_SLIDES },
      select: { value: true, updatedAt: true },
    });
    if (row) {
      return { ids: parseSlideIds(row.value), updatedAt: row.updatedAt.toISOString() };
    }

    const legacy = await this.prisma.db.platformSetting.findUnique({
      where: { key: PLATFORM_SETTING_HOME_HERO_MEDIA_ID },
      select: { value: true, updatedAt: true },
    });
    if (!legacy) {
      return { ids: [], updatedAt: null };
    }
    return {
      ids: [legacy.value.trim()].filter(Boolean),
      updatedAt: legacy.updatedAt.toISOString(),
    };
  }

  private async resolveSlides(ids: readonly string[]): Promise<HomeHeroSlide[]> {
    if (ids.length === 0) {
      return [];
    }

    const mediaRows = await this.prisma.db.mediaAsset.findMany({
      where: {
        id: { in: [...ids] },
        type: MediaAssetType.image,
      },
      select: { id: true, fileUrl: true },
    });

    const byId = new Map(mediaRows.map((row) => [row.id, row.fileUrl]));
    const slides: HomeHeroSlide[] = [];
    for (const id of ids) {
      const imageUrl = byId.get(id);
      if (imageUrl) {
        slides.push({ mediaAssetId: id, imageUrl });
      }
    }
    return slides;
  }

  private revalidateHome(): void {
    this.webRevalidation.revalidateTags([PUBLIC_CACHE_TAG.HOME]);
  }

  private revalidatePublicPages(): void {
    this.webRevalidation.revalidateTags([PUBLIC_CACHE_TAG.PUBLIC_PAGES]);
  }
}

const uniqueMediaIds = (ids: readonly string[]): string[] => [
  ...new Set(ids.map((id) => id.trim()).filter(Boolean)),
];

const parseSlideIds = (raw: string): string[] => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .map((item) => item.trim())
      .slice(0, HOME_HERO_MAX_SLIDES);
  } catch {
    return [trimmed];
  }
};
