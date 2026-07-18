import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  CheckInSummaryResponse,
  CreateEventRequest,
  EventListResponse,
  EventSummary,
  UpdateEventRequest,
} from "@toonexpo/contracts";
import { CheckInStatus, EventStatus, PublicationStatus } from "@toonexpo/db";

import { PrismaService } from "../../prisma/prisma.service.js";
import { toEventSummary } from "../mappers/exhibition.mapper.js";

@Injectable()
export class AdminEventsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<EventListResponse> {
    const events = await this.prisma.db.event.findMany({
      orderBy: [{ updatedAt: "desc" }],
    });
    return { data: events.map(toEventSummary) };
  }

  async create(body: CreateEventRequest): Promise<EventSummary> {
    const event = await this.prisma.db.event.create({
      data: {
        name: body.name,
        code: body.code,
        startDate: parseOptionalDate(body.startDate) ?? null,
        endDate: parseOptionalDate(body.endDate) ?? null,
        status: body.status ?? EventStatus.planning,
        publicationStatus: body.publicationStatus ?? PublicationStatus.draft,
      },
    });
    return toEventSummary(event);
  }

  async getById(id: string): Promise<EventSummary> {
    const event = await this.requireEvent(id);
    return toEventSummary(event);
  }

  async update(id: string, body: UpdateEventRequest): Promise<EventSummary> {
    await this.requireEvent(id);

    if (body.status === EventStatus.active) {
      await this.ensureSingleActiveEvent(id);
    }

    const event = await this.prisma.db.event.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.code !== undefined ? { code: body.code } : {}),
        ...(body.startDate !== undefined
          ? { startDate: parseNullableDate(body.startDate) }
          : {}),
        ...(body.endDate !== undefined
          ? { endDate: parseNullableDate(body.endDate) }
          : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.publicationStatus !== undefined
          ? { publicationStatus: body.publicationStatus }
          : {}),
      },
    });

    return toEventSummary(event);
  }

  async getCheckInSummary(eventId: string): Promise<CheckInSummaryResponse> {
    await this.requireEvent(eventId);

    const records = await this.prisma.db.checkInRecord.findMany({
      where: { eventId },
      select: { status: true, buyerProfileId: true, checkedInAt: true },
    });

    const allowedRecords = records.filter(
      (row) => row.status === CheckInStatus.allowed,
    );
    const duplicateAttempts = records.filter(
      (row) => row.status === CheckInStatus.duplicate_checkin,
    ).length;
    const deniedCount = records.filter((row) =>
      isDeniedStatus(row.status),
    ).length;

    const perDayMap = new Map<
      string,
      { allowedCount: number; duplicateAttempts: number; deniedCount: number }
    >();

    for (const row of records) {
      const dateKey = row.checkedInAt.toISOString().slice(0, 10);
      const bucket = perDayMap.get(dateKey) ?? {
        allowedCount: 0,
        duplicateAttempts: 0,
        deniedCount: 0,
      };

      if (row.status === CheckInStatus.allowed) {
        bucket.allowedCount += 1;
      } else if (row.status === CheckInStatus.duplicate_checkin) {
        bucket.duplicateAttempts += 1;
      } else if (isDeniedStatus(row.status)) {
        bucket.deniedCount += 1;
      }

      perDayMap.set(dateKey, bucket);
    }

    return {
      eventId,
      allowedCount: allowedRecords.length,
      duplicateAttempts,
      deniedCount,
      uniqueVisitors: new Set(
        allowedRecords.map((row) => row.buyerProfileId),
      ).size,
      perDay: [...perDayMap.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, counts]) => ({ date, ...counts })),
    };
  }

  private async requireEvent(id: string) {
    const event = await this.prisma.db.event.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException("Event not found");
    }
    return event;
  }

  private async ensureSingleActiveEvent(eventId: string): Promise<void> {
    const otherActive = await this.prisma.db.event.findFirst({
      where: { status: EventStatus.active, id: { not: eventId } },
      select: { id: true },
    });

    if (otherActive) {
      throw new ConflictException(
        "Another event is already active; deactivate it first",
      );
    }
  }
}

const parseOptionalDate = (value: string | undefined): Date | undefined =>
  value ? new Date(value) : undefined;

const parseNullableDate = (value: string | null): Date | null =>
  value ? new Date(value) : null;

const isDeniedStatus = (status: CheckInStatus): boolean =>
  status === CheckInStatus.denied_invalid_qr ||
  status === CheckInStatus.denied_blocked ||
  status === CheckInStatus.error;
