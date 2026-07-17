import { Injectable } from '@nestjs/common';
import {
  venueEntranceInputSchema,
  venuePathEdgeIdInputSchema,
  venuePathEdgeUpsertInputSchema,
  venuePathNodeIdInputSchema,
  venuePathNodeUpsertInputSchema,
} from '@toonexpo/contracts';

import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class ExhibitionPathService {
  constructor(private readonly prisma: PrismaService) {}

  async mutate(action: string, raw: unknown) {
    if (action === 'set-entrance') return this.setEntrance(raw);
    if (action === 'upsert-node') return this.upsertNode(raw);
    if (action === 'delete-node') return this.deleteNode(raw);
    if (action === 'upsert-edge') return this.upsertEdge(raw);
    if (action === 'delete-edge') return this.deleteEdge(raw);
    return { ok: false as const, errorKey: 'invalidInput' as const };
  }

  async ensureBoothNode(
    venueMapId: string,
    boothId: string,
    xPercent: number,
    yPercent: number,
  ): Promise<void> {
    await this.prisma.client.venuePathNode.upsert({
      where: { venueMapId_boothId: { venueMapId, boothId } },
      create: { venueMapId, boothId, xPercent, yPercent, kind: 'BOOTH' },
      update: { xPercent, yPercent, kind: 'BOOTH' },
    });
  }

  private async setEntrance(raw: unknown) {
    const parsed = venueEntranceInputSchema.safeParse(raw);
    if (!parsed.success) return invalid();
    const input = parsed.data;
    await this.prisma.client.$transaction(async (tx) => {
      await tx.venueMap.update({
        where: { id: input.venueMapId },
        data: {
          entranceXPercent: input.entranceXPercent,
          entranceYPercent: input.entranceYPercent,
        },
      });
      const current = await tx.venuePathNode.findFirst({
        where: { venueMapId: input.venueMapId, kind: 'ENTRANCE' },
      });
      if (current) {
        await tx.venuePathNode.update({
          where: { id: current.id },
          data: { xPercent: input.entranceXPercent, yPercent: input.entranceYPercent },
        });
      } else {
        await tx.venuePathNode.create({
          data: {
            venueMapId: input.venueMapId,
            xPercent: input.entranceXPercent,
            yPercent: input.entranceYPercent,
            kind: 'ENTRANCE',
          },
        });
      }
    });
    return { ok: true as const, venueMapId: input.venueMapId };
  }

  private async upsertNode(raw: unknown) {
    const parsed = venuePathNodeUpsertInputSchema.safeParse(raw);
    if (!parsed.success) return invalid();
    const input = parsed.data;
    if (input.kind === 'ENTRANCE') {
      return this.setEntrance({
        venueMapId: input.venueMapId,
        entranceXPercent: input.xPercent,
        entranceYPercent: input.yPercent,
      });
    }
    const node = input.nodeId
      ? await this.prisma.client.venuePathNode.update({
          where: { id: input.nodeId },
          data: {
            xPercent: input.xPercent,
            yPercent: input.yPercent,
            kind: input.kind,
            boothId: input.boothId ?? null,
          },
        })
      : await this.prisma.client.venuePathNode.create({
          data: {
            venueMapId: input.venueMapId,
            xPercent: input.xPercent,
            yPercent: input.yPercent,
            kind: input.kind,
            boothId: input.boothId,
          },
        });
    return { ok: true as const, nodeId: node.id, venueMapId: node.venueMapId };
  }

  private async deleteNode(raw: unknown) {
    const parsed = venuePathNodeIdInputSchema.safeParse(raw);
    if (!parsed.success) return invalid();
    const node = await this.prisma.client.venuePathNode.delete({
      where: { id: parsed.data.nodeId },
    });
    if (node.kind === 'ENTRANCE') {
      await this.prisma.client.venueMap.update({
        where: { id: node.venueMapId },
        data: { entranceXPercent: null, entranceYPercent: null },
      });
    }
    return { ok: true as const, nodeId: node.id, venueMapId: node.venueMapId };
  }

  private async upsertEdge(raw: unknown) {
    const parsed = venuePathEdgeUpsertInputSchema.safeParse(raw);
    if (!parsed.success) return invalid();
    const input = parsed.data;
    const [fromNodeId, toNodeId] =
      input.fromNodeId < input.toNodeId
        ? [input.fromNodeId, input.toNodeId]
        : [input.toNodeId, input.fromNodeId];
    const nodes = await this.prisma.client.venuePathNode.count({
      where: { venueMapId: input.venueMapId, id: { in: [fromNodeId, toNodeId] } },
    });
    if (nodes !== 2) {
      return { ok: false as const, errorKey: 'notFound' as const };
    }
    const edge = await this.prisma.client.venuePathEdge.upsert({
      where: {
        venueMapId_fromNodeId_toNodeId: { venueMapId: input.venueMapId, fromNodeId, toNodeId },
      },
      create: { venueMapId: input.venueMapId, fromNodeId, toNodeId },
      update: {},
    });
    return { ok: true as const, edgeId: edge.id, venueMapId: edge.venueMapId };
  }

  private async deleteEdge(raw: unknown) {
    const parsed = venuePathEdgeIdInputSchema.safeParse(raw);
    if (!parsed.success) return invalid();
    const edge = await this.prisma.client.venuePathEdge.delete({
      where: { id: parsed.data.edgeId },
    });
    return { ok: true as const, edgeId: edge.id, venueMapId: edge.venueMapId };
  }
}

function invalid() {
  return { ok: false as const, errorKey: 'invalidInput' as const };
}
