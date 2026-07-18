import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  CreateVenueMapRequest,
  RouteGraphPayload,
  RouteGraphResponse,
  UpdateVenueMapRequest,
  VenueMapListResponse,
  VenueMapSummary,
} from "@toonexpo/contracts";
import { PublicationStatus } from "@toonexpo/db";

import { PrismaService } from "../../prisma/prisma.service.js";
import { toVenueMapSummary } from "../mappers/exhibition.mapper.js";
import { AdminRouteGraphService } from "./admin-route-graph.service.js";

@Injectable()
export class AdminVenueMapsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly routeGraph: AdminRouteGraphService,
  ) {}

  async listByEvent(eventId: string): Promise<VenueMapListResponse> {
    await this.requireEvent(eventId);
    const maps = await this.prisma.db.venueMap.findMany({
      where: { eventId },
      orderBy: [{ updatedAt: "desc" }],
    });
    return { data: maps.map(toVenueMapSummary) };
  }

  async create(
    eventId: string,
    userId: string,
    body: CreateVenueMapRequest,
  ): Promise<VenueMapSummary> {
    await this.requireEvent(eventId);
    await this.requireMediaAsset(body.mediaAssetId);

    const map = await this.prisma.db.venueMap.create({
      data: {
        eventId,
        title: body.title,
        mediaAssetId: body.mediaAssetId,
        publicationStatus: body.publicationStatus ?? PublicationStatus.draft,
        width: body.width ?? null,
        height: body.height ?? null,
        createdByUserId: userId,
      },
    });

    return toVenueMapSummary(map);
  }

  async update(id: string, userId: string, body: UpdateVenueMapRequest): Promise<VenueMapSummary> {
    await this.requireVenueMap(id);

    if (body.mediaAssetId) {
      await this.requireMediaAsset(body.mediaAssetId);
    }

    const map = await this.prisma.db.venueMap.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.mediaAssetId !== undefined
          ? { mediaAssetId: body.mediaAssetId }
          : {}),
        ...(body.publicationStatus !== undefined
          ? { publicationStatus: body.publicationStatus }
          : {}),
        ...(body.width !== undefined ? { width: body.width } : {}),
        ...(body.height !== undefined ? { height: body.height } : {}),
        updatedByUserId: userId,
      },
    });

    return toVenueMapSummary(map);
  }

  async remove(id: string): Promise<void> {
    await this.requireVenueMap(id);
    await this.prisma.db.venueMap.delete({ where: { id } });
  }

  async getRouteGraph(mapId: string): Promise<RouteGraphResponse> {
    await this.requireVenueMap(mapId);
    return this.routeGraph.getGraph(mapId);
  }

  async replaceRouteGraph(
    mapId: string,
    body: RouteGraphPayload,
  ): Promise<RouteGraphResponse> {
    await this.requireVenueMap(mapId);
    return this.routeGraph.replaceGraph(mapId, body);
  }

  private async requireEvent(eventId: string): Promise<void> {
    const event = await this.prisma.db.event.findUnique({
      where: { id: eventId },
      select: { id: true },
    });
    if (!event) {
      throw new NotFoundException("Event not found");
    }
  }

  private async requireVenueMap(id: string): Promise<void> {
    const map = await this.prisma.db.venueMap.findUnique({ where: { id } });
    if (!map) {
      throw new NotFoundException("Venue map not found");
    }
  }

  private async requireMediaAsset(id: string): Promise<void> {
    const asset = await this.prisma.db.mediaAsset.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!asset) {
      throw new NotFoundException("Media asset not found");
    }
  }
}
