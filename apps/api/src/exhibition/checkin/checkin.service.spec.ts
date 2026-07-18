import { NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PrismaService } from "../../prisma/prisma.service.js";
import type { QrResolveService } from "../../qr/qr-resolve.service.js";
import { CheckInService } from "./checkin.service.js";

describe("CheckInService.scan", () => {
  const eventFindFirst = vi.fn();
  const checkInFindFirst = vi.fn();
  const checkInCreate = vi.fn();
  const qrCodeFindUnique = vi.fn();
  const qrCodeFindUniqueOrThrow = vi.fn();
  const resolve = vi.fn();

  let service: CheckInService;

  beforeEach(() => {
    vi.clearAllMocks();

    eventFindFirst.mockResolvedValue({ id: "ev_1" });
    qrCodeFindUniqueOrThrow.mockResolvedValue({ id: "qr_1" });

    const prisma = {
      db: {
        event: { findFirst: eventFindFirst, findUnique: eventFindFirst },
        checkInRecord: {
          findFirst: checkInFindFirst,
          findFirstOrThrow: checkInFindFirst,
          create: checkInCreate,
        },
        qrCode: {
          findUnique: qrCodeFindUnique,
          findUniqueOrThrow: qrCodeFindUniqueOrThrow,
        },
      },
    } as unknown as PrismaService;

    service = new CheckInService(
      prisma,
      { resolve } as unknown as QrResolveService,
      {
        get: vi.fn().mockReturnValue("pepper"),
      } as never,
      { track: vi.fn() } as never,
    );
  });

  it("creates an allowed check-in on first scan", async () => {
    resolve.mockResolvedValue({
      kind: "entrance_checkin",
      buyerProfileId: "bp_1",
      name: "Alice Visitor",
      scanEventId: "scan_1",
    });
    checkInFindFirst.mockResolvedValue(null);
    checkInCreate.mockResolvedValue({
      checkedInAt: new Date("2026-07-18T10:00:00.000Z"),
    });

    const result = await service.scan(
      { id: "staff_1", accountType: "entrance_staff" } as never,
      "token-1",
      "ev_1",
      {},
    );

    expect(checkInCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "allowed" }),
      }),
    );
    expect(result).toEqual({
      status: "allowed",
      visitorDisplayName: "Alice Visitor",
      checkedInAt: "2026-07-18T10:00:00.000Z",
      duplicateWarning: false,
    });
    expect(result).not.toHaveProperty("phone");
    expect(result).not.toHaveProperty("email");
    expect(result).not.toHaveProperty("buyerProfileId");
  });

  it("records duplicate_checkin on second scan", async () => {
    resolve.mockResolvedValue({
      kind: "entrance_checkin",
      buyerProfileId: "bp_1",
      name: "Alice Visitor",
      scanEventId: "scan_2",
    });
    checkInFindFirst.mockResolvedValue({ id: "ci_allowed_1" });
    checkInCreate.mockResolvedValue({
      checkedInAt: new Date("2026-07-18T10:05:00.000Z"),
    });

    const result = await service.scan(
      { id: "staff_1", accountType: "entrance_staff" } as never,
      "token-1",
      "ev_1",
      {},
    );

    expect(checkInCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "duplicate_checkin",
          duplicateOfCheckInId: "ci_allowed_1",
        }),
      }),
    );
    expect(result.status).toBe("duplicate_checkin");
    expect(result.duplicateWarning).toBe(true);
  });

  it("returns denied_invalid_qr without buyer private fields when token is unknown", async () => {
    resolve.mockRejectedValue(new NotFoundException());
    qrCodeFindUnique.mockResolvedValue(null);

    const result = await service.scan(
      { id: "staff_1", accountType: "entrance_staff" } as never,
      "bad-token",
      "ev_1",
      {},
    );

    expect(result.status).toBe("denied_invalid_qr");
    expect(result.visitorDisplayName).toBeNull();
    expect(checkInCreate).not.toHaveBeenCalled();
  });

  it("creates denied_blocked record for blocked QR", async () => {
    resolve.mockRejectedValue(new NotFoundException());
    qrCodeFindUnique.mockResolvedValue({
      id: "qr_blocked",
      status: "blocked",
      buyerProfile: { id: "bp_2", name: "Blocked Visitor" },
    });
    checkInCreate.mockResolvedValue({
      checkedInAt: new Date("2026-07-18T11:00:00.000Z"),
    });

    const result = await service.scan(
      { id: "staff_1", accountType: "entrance_staff" } as never,
      "blocked-token",
      "ev_1",
      {},
    );

    expect(result.status).toBe("denied_blocked");
    expect(result.visitorDisplayName).toBe("Blocked Visitor");
    expect(checkInCreate).toHaveBeenCalled();
  });
});
