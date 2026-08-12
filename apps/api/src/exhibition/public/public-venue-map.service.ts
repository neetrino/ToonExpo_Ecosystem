import { Injectable, NotFoundException } from "@nestjs/common";
import type { PublicVenueMapSnapshotResponse } from "@toonexpo/contracts";
import { PublicVenueMapSnapshotStatus } from "@toonexpo/db";

import { PrismaService } from "../../prisma/prisma.service.js";
import { toPublicVenueMapSnapshot } from "./public-venue-map.mapper.js";

const SNAPSHOT_NOT_FOUND_MESSAGE = "No published venue map is available";

const SNAPSHOT_INCLUDE = {
  backgroundMedia: { select: { fileUrl: true as const } },
  areas: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          type: true,
          partnerCompany: {
            select: { slug: true, publicationStatus: true },
          },
        },
      },
    },
  },
};

/**
 * Serves the active BOS venue-map snapshot to public visitors.
 */
@Injectable()
export class PublicVenueMapService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrent(): Promise<PublicVenueMapSnapshotResponse> {
    const snapshot = await this.prisma.db.publicVenueMapSnapshot.findFirst({
      where: { status: PublicVenueMapSnapshotStatus.active },
      orderBy: { activatedAt: "desc" },
      include: SNAPSHOT_INCLUDE,
    });

    if (!snapshot) {
      throw new NotFoundException(SNAPSHOT_NOT_FOUND_MESSAGE);
    }

    const mapped = toPublicVenueMapSnapshot(snapshot);
    if (!mapped) {
      throw new NotFoundException(SNAPSHOT_NOT_FOUND_MESSAGE);
    }
    return mapped;
  }
}
