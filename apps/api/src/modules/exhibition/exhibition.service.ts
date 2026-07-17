import { Injectable } from '@nestjs/common';
import {
  boothIdInputSchema,
  boothMoveInputSchema,
  boothUpsertInputSchema,
  venueMapUpsertInputSchema,
} from '@toonexpo/contracts';
import { Prisma } from '@toonexpo/db';

import { PrismaService } from '../../common/prisma.service';
import { ExhibitionPathService } from './exhibition-path.service';

const RECENT_CHECK_INS_LIMIT = 20;

@Injectable()
export class ExhibitionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paths: ExhibitionPathService,
  ) {}

  activeEvent() {
    return this.prisma.client.exhibitionEvent.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
      select: { id: true, name: true, code: true, startDate: true, endDate: true, status: true },
    });
  }

  async buyerCheckIns(userId: string) {
    const profile = await this.prisma.client.buyerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      return [];
    }
    const rows = await this.prisma.client.checkIn.findMany({
      where: { buyerProfileId: profile.id },
      orderBy: { checkedInAt: 'desc' },
      take: RECENT_CHECK_INS_LIMIT,
      select: {
        id: true,
        checkedInAt: true,
        event: { select: { name: true, code: true } },
      },
    });
    return rows.map((row) => ({
      id: row.id,
      checkedInAt: row.checkedInAt,
      eventName: row.event.name,
      eventCode: row.event.code,
    }));
  }

  async publicVenue() {
    const map = await this.prisma.client.venueMap.findFirst({
      where: { event: { status: 'ACTIVE' } },
      orderBy: { event: { startDate: 'desc' } },
      select: {
        id: true,
        imageUrl: true,
        imageAlt: true,
        entranceXPercent: true,
        entranceYPercent: true,
        event: { select: { id: true, name: true, code: true, status: true } },
        booths: {
          orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
          select: {
            id: true,
            code: true,
            label: true,
            xPercent: true,
            yPercent: true,
            note: true,
            company: { select: { id: true, name: true, slug: true } },
            partner: { select: { id: true, name: true, slug: true } },
            project: {
              select: {
                id: true,
                name: true,
                slug: true,
                company: { select: { slug: true } },
              },
            },
          },
        },
        pathNodes: {
          select: { id: true, xPercent: true, yPercent: true, kind: true, boothId: true },
        },
        pathEdges: { select: { id: true, fromNodeId: true, toNodeId: true } },
      },
    });
    if (!map) {
      return null;
    }
    return {
      ...map,
      booths: map.booths.map((booth) => ({
        ...booth,
        project: booth.project
          ? {
              id: booth.project.id,
              name: booth.project.name,
              slug: booth.project.slug,
              companySlug: booth.project.company.slug,
            }
          : null,
      })),
    };
  }

  async hasPublicVenue(): Promise<boolean> {
    return (await this.prisma.client.venueMap.count({ where: { event: { status: 'ACTIVE' } } })) > 0;
  }

  async companyBooth(userId: string, companyId: string) {
    if (!(await this.isMember(userId, companyId, 'BUILDER'))) {
      return null;
    }
    const booth = await this.prisma.client.booth.findFirst({
      where: { companyId, venueMap: { event: { status: 'ACTIVE' } } },
      orderBy: { sortOrder: 'asc' },
      select: {
        code: true,
        label: true,
        venueMap: { select: { event: { select: { name: true } } } },
      },
    });
    return booth
      ? { code: booth.code, label: booth.label, eventName: booth.venueMap.event.name }
      : null;
  }

  async adminVenue(eventId: string) {
    const event = await this.prisma.client.exhibitionEvent.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        venueMap: {
          select: {
            id: true,
            imageUrl: true,
            imageAlt: true,
            entranceXPercent: true,
            entranceYPercent: true,
            booths: {
              orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
              select: {
                id: true,
                code: true,
                label: true,
                xPercent: true,
                yPercent: true,
                note: true,
                sortOrder: true,
                companyId: true,
                partnerId: true,
                projectId: true,
                company: { select: { name: true } },
                partner: { select: { name: true } },
                project: { select: { name: true } },
              },
            },
            pathNodes: {
              select: { id: true, xPercent: true, yPercent: true, kind: true, boothId: true },
            },
            pathEdges: { select: { id: true, fromNodeId: true, toNodeId: true } },
          },
        },
      },
    });
    if (!event) {
      return null;
    }
    const venueMap = event.venueMap;
    return {
      event: { id: event.id, name: event.name, code: event.code, status: event.status },
      venueMap: venueMap
        ? {
            id: venueMap.id,
            imageUrl: venueMap.imageUrl,
            imageAlt: venueMap.imageAlt,
            entranceXPercent: venueMap.entranceXPercent,
            entranceYPercent: venueMap.entranceYPercent,
          }
        : null,
      booths: (venueMap?.booths ?? []).map((booth) => ({
        ...booth,
        companyName: booth.company?.name ?? null,
        partnerName: booth.partner?.name ?? null,
        projectName: booth.project?.name ?? null,
        company: undefined,
        partner: undefined,
        project: undefined,
      })),
      pathNodes: venueMap?.pathNodes ?? [],
      pathEdges: venueMap?.pathEdges ?? [],
    };
  }

  async assignmentOptions() {
    const [companies, partners, projects] = await Promise.all([
      this.prisma.client.company.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
      this.prisma.client.partner.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
      this.prisma.client.project.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, companyId: true },
      }),
    ]);
    return { companies, partners, projects };
  }

  async mutate(action: string, raw: unknown) {
    if (action === 'upsert-map') {
      const parsed = venueMapUpsertInputSchema.safeParse(raw);
      if (!parsed.success) return invalid();
      const map = await this.prisma.client.venueMap.upsert({
        where: { eventId: parsed.data.eventId },
        create: parsed.data,
        update: {
          imageUrl: parsed.data.imageUrl,
          imageAlt: parsed.data.imageAlt ?? null,
          entranceXPercent: parsed.data.entranceXPercent,
          entranceYPercent: parsed.data.entranceYPercent,
        },
        select: { id: true, eventId: true },
      });
      return { ok: true as const, venueMapId: map.id, eventId: map.eventId };
    }
    if (action === 'upsert-booth') return this.upsertBooth(raw);
    if (action === 'move-booth') return this.moveBooth(raw);
    if (action === 'delete-booth') return this.deleteBooth(raw);
    return this.paths.mutate(action, raw);
  }

  private async upsertBooth(raw: unknown) {
    const parsed = boothUpsertInputSchema.safeParse(raw);
    if (!parsed.success) return invalid();
    try {
      const input = parsed.data;
      const booth = input.boothId
        ? await this.prisma.client.booth.update({
            where: { id: input.boothId },
            data: {
              code: input.code.toUpperCase(),
              label: input.label,
              xPercent: input.xPercent,
              yPercent: input.yPercent,
              companyId: input.companyId ?? null,
              partnerId: input.partnerId ?? null,
              projectId: input.projectId ?? null,
              note: input.note ?? null,
              sortOrder: input.sortOrder ?? 0,
            },
          })
        : await this.prisma.client.booth.create({
            data: { ...input, boothId: undefined, code: input.code.toUpperCase() },
          });
      await this.paths.ensureBoothNode(booth.venueMapId, booth.id, input.xPercent, input.yPercent);
      return { ok: true as const, boothId: booth.id, venueMapId: booth.venueMapId };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return { ok: false as const, errorKey: 'nameTaken' as const };
      }
      throw error;
    }
  }

  private async moveBooth(raw: unknown) {
    const parsed = boothMoveInputSchema.safeParse(raw);
    if (!parsed.success) return invalid();
    const booth = await this.prisma.client.booth.update({
      where: { id: parsed.data.boothId },
      data: { xPercent: parsed.data.xPercent, yPercent: parsed.data.yPercent },
    });
    await this.paths.ensureBoothNode(booth.venueMapId, booth.id, booth.xPercent, booth.yPercent);
    return { ok: true as const, boothId: booth.id, venueMapId: booth.venueMapId };
  }

  private async deleteBooth(raw: unknown) {
    const parsed = boothIdInputSchema.safeParse(raw);
    if (!parsed.success) return invalid();
    const booth = await this.prisma.client.booth.delete({ where: { id: parsed.data.boothId } });
    return { ok: true as const, boothId: booth.id, venueMapId: booth.venueMapId };
  }

  private async isMember(userId: string, companyId: string, role: 'BUILDER'): Promise<boolean> {
    return Boolean(await this.prisma.client.companyMember.findFirst({ where: { userId, companyId, role } }));
  }
}

function invalid() {
  return { ok: false as const, errorKey: 'invalidInput' as const };
}
