import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ANALYTICS_EVENT_TYPES, type AnalyticsEventType } from '@toonexpo/domain';

import { PrismaService } from '../../common/prisma.service';
import { AppOriginGuard } from '../auth/app-origin.guard';

type AnalyticsInput = {
  type: AnalyticsEventType;
  companyId: string;
  projectId?: string;
  apartmentId?: string;
};

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(AppOriginGuard)
export class AnalyticsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('events')
  async record(@Body() body: unknown): Promise<void> {
    const boothInput = parseBoothInput(body);
    if (boothInput) {
      const booth = await this.prisma.client.booth.findUnique({
        where: { id: boothInput.boothId },
        select: {
          companyId: true,
          projectId: true,
          project: { select: { companyId: true } },
          partner: { select: { companyId: true } },
        },
      });
      const companyId =
        booth?.companyId ?? booth?.project?.companyId ?? booth?.partner?.companyId;
      if (booth && companyId) {
        await this.prisma.client.analyticsEvent.create({
          data: {
            type: boothInput.type,
            companyId,
            projectId: booth.projectId ?? undefined,
          },
        });
      }
      return;
    }
    const input = parseInput(body);
    if (!input) {
      return;
    }
    await this.prisma.client.analyticsEvent.create({ data: input });
  }
}

function parseBoothInput(
  body: unknown,
): { boothId: string; type: 'BOOTH_SELECTED' | 'ROUTE_REQUESTED' } | null {
  if (!body || typeof body !== 'object') {
    return null;
  }
  const row = body as Record<string, unknown>;
  if (
    typeof row.boothId !== 'string' ||
    (row.type !== 'BOOTH_SELECTED' && row.type !== 'ROUTE_REQUESTED')
  ) {
    return null;
  }
  return { boothId: row.boothId, type: row.type };
}

function parseInput(body: unknown): AnalyticsInput | null {
  if (!body || typeof body !== 'object') {
    return null;
  }
  const row = body as Record<string, unknown>;
  if (
    typeof row.type !== 'string' ||
    !ANALYTICS_EVENT_TYPES.includes(row.type as AnalyticsEventType) ||
    typeof row.companyId !== 'string'
  ) {
    return null;
  }
  return {
    type: row.type as AnalyticsEventType,
    companyId: row.companyId,
    projectId: typeof row.projectId === 'string' ? row.projectId : undefined,
    apartmentId: typeof row.apartmentId === 'string' ? row.apartmentId : undefined,
  };
}
