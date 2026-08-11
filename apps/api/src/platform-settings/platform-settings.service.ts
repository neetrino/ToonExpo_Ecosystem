import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AdminHomeHero, PublicHomeHero } from '@toonexpo/contracts';
import { MediaAssetType } from '@toonexpo/db';

import {
  PUBLIC_CACHE_TAG,
  WebRevalidationService,
} from '../common/web-revalidation/web-revalidation.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  PLATFORM_SETTING_HOME_HERO_DESCRIPTION,
  PLATFORM_SETTING_HOME_HERO_MEDIA_ID,
} from './platform-settings.constants.js';

const emptyPublicHero = (): PublicHomeHero => ({
  mediaAssetId: null,
  imageUrl: null,
});

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
    const setting = await this.prisma.db.platformSetting.findUnique({
      where: { key: PLATFORM_SETTING_HOME_HERO_MEDIA_ID },
      select: { value: true, updatedAt: true },
    });

    if (!setting) {
      return { ...emptyPublicHero(), updatedAt: null };
    }

    const media = await this.findHeroImage(setting.value);
    if (!media) {
      return { ...emptyPublicHero(), updatedAt: setting.updatedAt.toISOString() };
    }

    return {
      mediaAssetId: media.id,
      imageUrl: media.fileUrl,
      updatedAt: setting.updatedAt.toISOString(),
    };
  }

  async updateHomeHero(
    mediaAssetId: string | null,
    updatedByUserId: string,
  ): Promise<AdminHomeHero> {
    if (mediaAssetId !== null && mediaAssetId.trim().length === 0) {
      throw new BadRequestException('mediaAssetId must be a non-empty string or null');
    }

    if (mediaAssetId === null) {
      await this.prisma.db.platformSetting.deleteMany({
        where: { key: PLATFORM_SETTING_HOME_HERO_MEDIA_ID },
      });
      this.revalidateHome();
      return { ...emptyPublicHero(), updatedAt: null };
    }

    const media = await this.findHeroImage(mediaAssetId);
    if (!media) {
      throw new NotFoundException('Media asset not found or is not an image');
    }

    const setting = await this.prisma.db.platformSetting.upsert({
      where: { key: PLATFORM_SETTING_HOME_HERO_MEDIA_ID },
      create: {
        key: PLATFORM_SETTING_HOME_HERO_MEDIA_ID,
        value: media.id,
        valueType: 'string',
        description: PLATFORM_SETTING_HOME_HERO_DESCRIPTION,
        updatedByUserId,
      },
      update: {
        value: media.id,
        updatedByUserId,
      },
    });

    this.revalidateHome();

    return {
      mediaAssetId: media.id,
      imageUrl: media.fileUrl,
      updatedAt: setting.updatedAt.toISOString(),
    };
  }

  private async resolveHomeHero(): Promise<PublicHomeHero> {
    const setting = await this.prisma.db.platformSetting.findUnique({
      where: { key: PLATFORM_SETTING_HOME_HERO_MEDIA_ID },
      select: { value: true },
    });

    if (!setting?.value) {
      return emptyPublicHero();
    }

    const media = await this.findHeroImage(setting.value);
    if (!media) {
      return emptyPublicHero();
    }

    return { mediaAssetId: media.id, imageUrl: media.fileUrl };
  }

  private async findHeroImage(
    mediaAssetId: string,
  ): Promise<{ id: string; fileUrl: string } | null> {
    const trimmed = mediaAssetId.trim();
    if (trimmed.length === 0) {
      return null;
    }

    const media = await this.prisma.db.mediaAsset.findUnique({
      where: { id: trimmed },
      select: { id: true, fileUrl: true, type: true },
    });

    if (!media || media.type !== MediaAssetType.image) {
      return null;
    }

    return { id: media.id, fileUrl: media.fileUrl };
  }

  private revalidateHome(): void {
    this.webRevalidation.revalidateTags([PUBLIC_CACHE_TAG.HOME]);
  }
}
