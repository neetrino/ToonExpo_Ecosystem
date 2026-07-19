import { BadRequestException, NotFoundException } from "@nestjs/common";
import { RequestSource } from "@toonexpo/db";

import type { PrismaService } from "../../prisma/prisma.service.js";
import type { IntakeCreateContext } from "./request-intake.types.js";

export const assertIntakeSourceRequirements = (
  context: IntakeCreateContext,
): void => {
  if (
    context.source === RequestSource.buyer_project_request &&
    (!context.buyerProfileId || !context.projectId)
  ) {
    throw new BadRequestException(
      "buyer_project_request requires buyer and projectId",
    );
  }
  if (
    context.source === RequestSource.builder_buyer_qr_scan &&
    (!context.buyerProfileId || !context.scanEventId)
  ) {
    throw new BadRequestException(
      "builder_buyer_qr_scan requires buyer and scanEventId",
    );
  }
  if (
    context.source === RequestSource.manual_builder_entry &&
    !context.contactName?.trim()
  ) {
    throw new BadRequestException("manual_builder_entry requires contactName");
  }
};

export const validateIntakeProjectAndApartment = async (
  db: PrismaService["db"],
  context: IntakeCreateContext,
): Promise<void> => {
  if (context.projectId) {
    const project = await db.project.findFirst({
      where: {
        id: context.projectId,
        builderCompanyId: context.builderCompanyId,
      },
      select: { id: true },
    });
    if (!project) {
      throw new NotFoundException("Project not found");
    }
  }
  if (!context.apartmentId) {
    return;
  }
  const apartment = await db.apartment.findFirst({
    where: {
      id: context.apartmentId,
      project: { builderCompanyId: context.builderCompanyId },
      ...(context.projectId ? { projectId: context.projectId } : {}),
    },
    select: { id: true, projectId: true },
  });
  if (!apartment) {
    throw new NotFoundException("Apartment not found");
  }
  if (context.projectId && apartment.projectId !== context.projectId) {
    throw new BadRequestException("Apartment does not belong to project");
  }
};
