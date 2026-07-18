import { NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../../prisma/prisma.service.js";
import { BuyerCheckInService } from "./buyer-checkin.service.js";

describe("BuyerCheckInService.getStatus", () => {
  const buyerProfileFindUnique = vi.fn();
  const eventFindFirst = vi.fn();
  const checkInFindFirst = vi.fn();
  const checkInFindMany = vi.fn();

  let service: BuyerCheckInService;

  beforeEach(() => {
    vi.clearAllMocks();

    const prisma = {
      db: {
        buyerProfile: { findUnique: buyerProfileFindUnique },
        event: { findFirst: eventFindFirst },
        checkInRecord: {
          findFirst: checkInFindFirst,
          findMany: checkInFindMany,
        },
      },
    } as unknown as PrismaService;

    service = new BuyerCheckInService(prisma);
  });

  it("returns checked-in status for the active event", async () => {
    buyerProfileFindUnique.mockResolvedValue({ id: "bp_1" });
    eventFindFirst.mockResolvedValue({ id: "ev_active", name: "Summer Expo" });
    checkInFindFirst.mockResolvedValue({
      checkedInAt: new Date("2026-07-18T10:00:00.000Z"),
    });
    checkInFindMany.mockResolvedValue([
      {
        checkedInAt: new Date("2025-12-01T09:00:00.000Z"),
        event: { id: "ev_past", name: "Winter Expo" },
      },
    ]);

    const result = await service.getStatus("user_buyer");

    expect(result).toEqual({
      activeEvent: { id: "ev_active", name: "Summer Expo" },
      current: {
        checkedIn: true,
        eventId: "ev_active",
        eventName: "Summer Expo",
        checkedInAt: "2026-07-18T10:00:00.000Z",
      },
      history: [
        {
          eventId: "ev_past",
          eventName: "Winter Expo",
          checkedInAt: "2025-12-01T09:00:00.000Z",
        },
      ],
    });
    expect(result).not.toHaveProperty("checkedInByUserId");
    expect(result.current).not.toHaveProperty("staffUserId");
  });

  it("returns not checked in when buyer has no allowed record for active event", async () => {
    buyerProfileFindUnique.mockResolvedValue({ id: "bp_1" });
    eventFindFirst.mockResolvedValue({ id: "ev_active", name: "Summer Expo" });
    checkInFindFirst.mockResolvedValue(null);
    checkInFindMany.mockResolvedValue([]);

    const result = await service.getStatus("user_buyer");

    expect(result.current).toEqual({
      checkedIn: false,
      eventId: "ev_active",
      eventName: "Summer Expo",
      checkedInAt: null,
    });
  });

  it("returns a clean response when there is no active event", async () => {
    buyerProfileFindUnique.mockResolvedValue({ id: "bp_1" });
    eventFindFirst.mockResolvedValue(null);
    checkInFindMany.mockResolvedValue([
      {
        checkedInAt: new Date("2025-12-01T09:00:00.000Z"),
        event: { id: "ev_past", name: "Winter Expo" },
      },
    ]);

    const result = await service.getStatus("user_buyer");

    expect(result.activeEvent).toBeNull();
    expect(result.current).toBeNull();
    expect(result.history).toHaveLength(1);
    expect(checkInFindFirst).not.toHaveBeenCalled();
  });

  it("throws when buyer profile is missing", async () => {
    buyerProfileFindUnique.mockResolvedValue(null);

    await expect(service.getStatus("user_unknown")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
