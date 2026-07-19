import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { CompanyMemberGuard } from "../company/guards/company-member.guard.js";
import type { AppEnv } from "../config/env.validation.js";
import { AdminMediaController } from "./admin/admin-media.controller.js";
import { isR2ConfiguredFromService } from "./media.config.js";
import { MediaUploadService } from "./media-upload.service.js";
import { R2_STORAGE } from "./media.types.js";
import { PortalMediaController } from "./portal/portal-media.controller.js";
import { R2StorageService } from "./r2-storage.service.js";

const createR2Storage = (
  configService: ConfigService<AppEnv, true>,
): R2StorageService | null => {
  if (!isR2ConfiguredFromService(configService)) {
    return null;
  }

  return new R2StorageService(configService);
};

@Module({
  controllers: [PortalMediaController, AdminMediaController],
  providers: [
    MediaUploadService,
    {
      provide: R2_STORAGE,
      inject: [ConfigService],
      useFactory: createR2Storage,
    },
    CompanyMemberGuard,
  ],
  exports: [MediaUploadService],
})
export class MediaModule {}
