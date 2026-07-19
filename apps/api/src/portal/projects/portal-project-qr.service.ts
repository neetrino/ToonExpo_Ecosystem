import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ProjectQrResponse } from '@toonexpo/contracts';
import { DEFAULT_LOCALE } from '@toonexpo/shared';

import type { AppEnv } from '../../config/env.validation.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { buildProjectQrPayloadUrl } from '../../qr/qr-payload.util.js';
import { entityNotFound } from '../utils/access.js';

@Injectable()
export class PortalProjectQrService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<AppEnv, true>,
  ) {}

  async getProjectQr(companyId: string, projectId: string): Promise<ProjectQrResponse> {
    const project = await this.prisma.db.project.findFirst({
      where: { id: projectId, builderCompanyId: companyId },
      select: { id: true, slug: true },
    });
    if (!project) {
      throw entityNotFound('Project');
    }
    const appUrl = this.configService.get('APP_URL', { infer: true });
    return {
      projectId: project.id,
      slug: project.slug,
      payloadUrl: buildProjectQrPayloadUrl(appUrl, DEFAULT_LOCALE, project.id),
    };
  }
}
