import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  ReadinessInternalNoteItem,
  ReadinessRecommendationItem,
  ReadinessRequiredActionItem,
} from "@toonexpo/contracts";
import {
  ReadinessRequiredActionStatus,
} from "@toonexpo/db";

import { PrismaService } from "../../prisma/prisma.service.js";
import {
  toReadinessInternalNoteItem,
  toReadinessRecommendationItem,
  toReadinessRequiredActionItem,
} from "../mappers/readiness.mapper.js";
import { ReadinessAssessmentSupportService } from "./readiness-assessment-support.service.js";
import type {
  CreateReadinessInternalNoteDto,
  CreateReadinessRecommendationDto,
  CreateReadinessRequiredActionDto,
  UpdateReadinessRecommendationDto,
  UpdateReadinessRequiredActionDto,
} from "./dto/readiness-nested.dto.js";

@Injectable()
export class AdminReadinessNestedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly support: ReadinessAssessmentSupportService,
  ) {}

  async createRecommendation(
    assessmentId: string,
    userId: string,
    body: CreateReadinessRecommendationDto,
  ): Promise<ReadinessRecommendationItem> {
    await this.support.getAssessmentOrThrow(assessmentId);
    if (body.scoreId) {
      await this.support.assertScoreBelongsToAssessment(assessmentId, body.scoreId);
    }

    const item = await this.prisma.db.readinessRecommendation.create({
      data: {
        assessmentId,
        scoreId: body.scoreId ?? null,
        title: body.title.trim(),
        description: body.description.trim(),
        visibility: body.visibility,
        sortOrder: body.sortOrder ?? 0,
        createdByUserId: userId,
      },
    });

    return toReadinessRecommendationItem(item);
  }

  async updateRecommendation(
    assessmentId: string,
    recId: string,
    body: UpdateReadinessRecommendationDto,
  ): Promise<ReadinessRecommendationItem> {
    await this.assertRecommendation(assessmentId, recId);
    if (body.scoreId) {
      await this.support.assertScoreBelongsToAssessment(assessmentId, body.scoreId);
    }

    const item = await this.prisma.db.readinessRecommendation.update({
      where: { id: recId },
      data: {
        ...(body.title !== undefined ? { title: body.title.trim() } : {}),
        ...(body.description !== undefined
          ? { description: body.description.trim() }
          : {}),
        ...(body.visibility !== undefined ? { visibility: body.visibility } : {}),
        ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
        ...(body.scoreId !== undefined ? { scoreId: body.scoreId } : {}),
      },
    });

    return toReadinessRecommendationItem(item);
  }

  async deleteRecommendation(assessmentId: string, recId: string): Promise<void> {
    await this.assertRecommendation(assessmentId, recId);
    await this.prisma.db.readinessRecommendation.delete({ where: { id: recId } });
  }

  async createRequiredAction(
    assessmentId: string,
    userId: string,
    body: CreateReadinessRequiredActionDto,
  ): Promise<ReadinessRequiredActionItem> {
    await this.support.getAssessmentOrThrow(assessmentId);
    if (body.scoreId) {
      await this.support.assertScoreBelongsToAssessment(assessmentId, body.scoreId);
    }

    const item = await this.prisma.db.readinessRequiredAction.create({
      data: {
        assessmentId,
        scoreId: body.scoreId ?? null,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        status: body.status ?? ReadinessRequiredActionStatus.open,
        visibility: body.visibility,
        relatedEntityType: body.relatedEntityType?.trim() || null,
        relatedEntityId: body.relatedEntityId?.trim() || null,
        createdByUserId: userId,
      },
    });

    return toReadinessRequiredActionItem(item);
  }

  async updateRequiredAction(
    assessmentId: string,
    actionId: string,
    body: UpdateReadinessRequiredActionDto,
  ): Promise<ReadinessRequiredActionItem> {
    await this.assertRequiredAction(assessmentId, actionId);
    if (body.scoreId) {
      await this.support.assertScoreBelongsToAssessment(assessmentId, body.scoreId);
    }

    const item = await this.prisma.db.readinessRequiredAction.update({
      where: { id: actionId },
      data: {
        ...(body.title !== undefined ? { title: body.title.trim() } : {}),
        ...(body.description !== undefined
          ? { description: body.description?.trim() || null }
          : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.visibility !== undefined ? { visibility: body.visibility } : {}),
        ...(body.scoreId !== undefined ? { scoreId: body.scoreId } : {}),
        ...(body.relatedEntityType !== undefined
          ? { relatedEntityType: body.relatedEntityType?.trim() || null }
          : {}),
        ...(body.relatedEntityId !== undefined
          ? { relatedEntityId: body.relatedEntityId?.trim() || null }
          : {}),
      },
    });

    return toReadinessRequiredActionItem(item);
  }

  async deleteRequiredAction(assessmentId: string, actionId: string): Promise<void> {
    await this.assertRequiredAction(assessmentId, actionId);
    await this.prisma.db.readinessRequiredAction.delete({ where: { id: actionId } });
  }

  async createInternalNote(
    assessmentId: string,
    userId: string,
    body: CreateReadinessInternalNoteDto,
  ): Promise<ReadinessInternalNoteItem> {
    await this.support.getAssessmentOrThrow(assessmentId);
    if (body.scoreId) {
      await this.support.assertScoreBelongsToAssessment(assessmentId, body.scoreId);
    }

    const note = await this.prisma.db.readinessInternalNote.create({
      data: {
        assessmentId,
        scoreId: body.scoreId ?? null,
        authorUserId: userId,
        body: body.body.trim(),
      },
    });

    return toReadinessInternalNoteItem(note);
  }

  async deleteInternalNote(assessmentId: string, noteId: string): Promise<void> {
    const note = await this.prisma.db.readinessInternalNote.findFirst({
      where: { id: noteId, assessmentId },
      select: { id: true },
    });
    if (!note) {
      throw new NotFoundException("Internal note not found");
    }
    await this.prisma.db.readinessInternalNote.delete({ where: { id: noteId } });
  }

  private async assertRecommendation(
    assessmentId: string,
    recId: string,
  ): Promise<void> {
    const item = await this.prisma.db.readinessRecommendation.findFirst({
      where: { id: recId, assessmentId },
      select: { id: true },
    });
    if (!item) {
      throw new NotFoundException("Recommendation not found");
    }
  }

  private async assertRequiredAction(
    assessmentId: string,
    actionId: string,
  ): Promise<void> {
    const item = await this.prisma.db.readinessRequiredAction.findFirst({
      where: { id: actionId, assessmentId },
      select: { id: true },
    });
    if (!item) {
      throw new NotFoundException("Required action not found");
    }
  }
}
