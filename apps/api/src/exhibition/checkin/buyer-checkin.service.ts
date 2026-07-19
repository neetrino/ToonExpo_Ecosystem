import { Injectable } from "@nestjs/common";
import type { BuyerCheckInStatusResponse } from "@toonexpo/contracts";
import { CheckInStatus, EventStatus } from "@toonexpo/db";

import { PrismaService } from "../../prisma/prisma.service.js";
import { entityNotFound } from "../../portal/utils/access.js";
import { BUYER_CHECKIN_HISTORY_LIMIT } from "../exhibition.constants.js";

@Injectable()
export class BuyerCheckInService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatus(userId: string): Promise<BuyerCheckInStatusResponse> {
    const profile = await this.requireBuyerProfile(userId);
    const activeEvent = await this.findActiveEvent();
    const current = activeEvent
      ? await this.buildCurrentStatus(activeEvent, profile.id)
      : null;
    const history = await this.listPastCheckIns(profile.id, activeEvent?.id);

    return {
      activeEvent,
      current,
      history,
    };
  }

  private async requireBuyerProfile(userId: string): Promise<{ id: string }> {
    const profile = await this.prisma.db.buyerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw entityNotFound("Buyer profile");
    }

    return profile;
  }

  private async findActiveEvent(): Promise<{
    id: string;
    name: string;
  } | null> {
    const event = await this.prisma.db.event.findFirst({
      where: { status: EventStatus.active },
      orderBy: [{ updatedAt: "desc" }],
      select: { id: true, name: true },
    });

    return event ?? null;
  }

  private async buildCurrentStatus(
    activeEvent: { id: string; name: string },
    buyerProfileId: string,
  ): Promise<BuyerCheckInStatusResponse["current"]> {
    const allowed = await this.prisma.db.checkInRecord.findFirst({
      where: {
        eventId: activeEvent.id,
        buyerProfileId,
        status: CheckInStatus.allowed,
      },
      select: { checkedInAt: true },
    });

    return {
      checkedIn: Boolean(allowed),
      eventId: activeEvent.id,
      eventName: activeEvent.name,
      checkedInAt: allowed?.checkedInAt.toISOString() ?? null,
    };
  }

  private async listPastCheckIns(
    buyerProfileId: string,
    activeEventId?: string,
  ): Promise<BuyerCheckInStatusResponse["history"]> {
    const records = await this.prisma.db.checkInRecord.findMany({
      where: {
        buyerProfileId,
        status: CheckInStatus.allowed,
        ...(activeEventId ? { eventId: { not: activeEventId } } : {}),
      },
      orderBy: [{ checkedInAt: "desc" }],
      take: BUYER_CHECKIN_HISTORY_LIMIT,
      include: {
        event: { select: { id: true, name: true } },
      },
    });

    return records.map((row) => ({
      eventId: row.event.id,
      eventName: row.event.name,
      checkedInAt: row.checkedInAt.toISOString(),
    }));
  }
}
