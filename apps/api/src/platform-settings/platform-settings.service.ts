import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AdminHomeHero, HomeHeroSlide, PublicHomeHero } from '@toonexpo/contracts';
import { MediaAssetType } from '@toonexpo/db';

import {
  PUBLIC_CACHE_TAG,
  WebRevalidationService,
} from '../common/web-revalidation/web-revalidation.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  HOME_HERO_MAX_SLIDES,
  PLATFORM_SETTING_HOME_HERO_DESCRIPTION,
  PLATFORM_SETTING_HOME_HERO_MEDIA_ID,
  PLATFORM_SETTING_HOME_HERO_SLIDES,
} from './platform-settings.constants.js';

const emptyPublicHero = (): PublicHomeHero => ({ slides: [] });

/**
 * Reads/writes platform settings used by public surfaces (home hero, etc.).
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
    const { ids, updatedAt } = await this.readStoredSlideIds();
    const slides = await this.resolveSlides(ids);
    return { slides, updatedAt };
  }

  async updateHomeHero(
    mediaAssetIds: string[] | null,
    updatedByUserId: string,
  ): Promise<AdminHomeHero> {
    if (mediaAssetIds === null || mediaAssetIds.length === 0) {
      await this.prisma.db.platformSetting.deleteMany({
        where: {
          key: {
            in: [PLATFORM_SETTING_HOME_HERO_SLIDES, PLATFORM_SETTING_HOME_HERO_MEDIA_ID],
          },
        },
      });
      this.revalidateHome();
      return { ...emptyPublicHero(), updatedAt: null };
    }

    if (mediaAssetIds.length > HOME_HERO_MAX_SLIDES) {
      throw new BadRequestException(`At most ${HOME_HERO_MAX_SLIDES} hero slides are allowed`);
    }

    const uniqueIds = [...new Set(mediaAssetIds.map((id) => id.trim()).filter(Boolean))];
    if (uniqueIds.length !== mediaAssetIds.length) {
      throw new BadRequestException('mediaAssetIds must be non-empty and unique');
    }

    const slides = await this.resolveSlides(uniqueIds);
    if (slides.length !== uniqueIds.length) {
      throw new NotFoundException('One or more media assets were not found or are not images');
    }

    const setting = await this.prisma.db.platformSetting.upsert({
      where: { key: PLATFORM_SETTING_HOME_HERO_SLIDES },
      create: {
        key: PLATFORM_SETTING_HOME_HERO_SLIDES,
        value: JSON.stringify(uniqueIds),
        valueType: 'json',
        description: PLATFORM_SETTING_HOME_HERO_DESCRIPTION,
        updatedByUserId,
      },
      update: {
        value: JSON.stringify(uniqueIds),
        valueType: 'json',
        updatedByUserId,
      },
    });

    // Drop legacy single-id key after migrating to slides JSON.
    await this.prisma.db.platformSetting.deleteMany({
      where: { key: PLATFORM_SETTING_HOME_HERO_MEDIA_ID },
    });

    this.revalidateHome();

    return {
      slides,
      updatedAt: setting.updatedAt.toISOString(),
    };
  }

  private async resolveHomeHero(): Promise<PublicHomeHero> {
    const { ids } = await this.readStoredSlideIds();
    const slides = await this.resolveSlides(ids);
    return { slides };
  }

  private async readStoredSlideIds(): Promise<{
    ids: string[];
    updatedAt: string | null;
  }> {
    const slidesSetting = await this.prisma.db.platformSetting.findUnique({
      where: { key: PLATFORM_SETTING_HOME_HERO_SLIDES },
      select: { value: true, updatedAt: true },
    });

    if (slidesSetting) {
      return {
        ids: parseSlideIds(slidesSetting.value),
        updatedAt: slidesSetting.updatedAt.toISOString(),
      };
    }

    const legacy = await this.prisma.db.platformSetting.findUnique({
      where: { key: PLATFORM_SETTING_HOME_HERO_MEDIA_ID },
      select: { value: true, updatedAt: true },
    });

    if (!legacy?.value.trim()) {
      return { ids: [], updatedAt: null };
    }

    return {
      ids: [legacy.value.trim()],
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
}

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
    // Legacy accidental plain string under the slides key.
    return [trimmed];
  }
};
