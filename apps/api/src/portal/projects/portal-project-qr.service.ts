import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { ProjectQrResponse } from "@toonexpo/contracts";

import type { CompanyMemberContext } from "../../company/types/company-member-context.js";
import type { AppEnv } from "../../config/env.validation.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { buildProjectQrPayloadUrl } from "../../qr/qr-payload.util.js";
import { entityNotFound } from "../utils/access.js";

@Injectable()
export class PortalProjectQrService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<AppEnv, true>,
  ) {}

  async getProjectQr(
    member: CompanyMemberContext,
    projectId: string,
  ): Promise<ProjectQrResponse> {
    const project = await this.prisma.db.project.findFirst({
      where: { id: projectId, builderCompanyId: member.companyId },
      select: { id: true, slug: true },
    });
    if (!project) {
      throw entityNotFound("Project");
    }
    const appUrl = this.configService.get("APP_URL", { infer: true });
    const locale = this.configService.get("DEFAULT_LOCALE", { infer: true });
    return {
      projectId: project.id,
      slug: project.slug,
      payloadUrl: buildProjectQrPayloadUrl(appUrl, locale, project.id),
    };
  }
}
