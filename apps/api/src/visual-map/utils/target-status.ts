import { BadRequestException } from "@nestjs/common";
import type { VisualHotspotTargetStatus } from "@toonexpo/contracts";
import { PublicationStatus } from "@toonexpo/db";

/**
 * Resolves editor target status from entity existence and publication.
 */
export const resolveTargetStatus = (
  entity: { publicationStatus: PublicationStatus } | null | undefined,
): VisualHotspotTargetStatus => {
  if (!entity) {
    return "missing";
  }
  if (entity.publicationStatus !== PublicationStatus.published) {
    return "unpublished";
  }
  return "ok";
};

/**
 * Returns true when a hotspot target is safe for public display.
 */
export const isPublicTargetOk = (
  entity: { publicationStatus: PublicationStatus } | null | undefined,
): boolean => resolveTargetStatus(entity) === "ok";

/**
 * Formats a floor label for public navigation.
 */
export const formatFloorDisplayName = (floor: {
  displayLabel: string | null;
  name: string | null;
  number: number;
}): string => floor.displayLabel ?? floor.name ?? `Floor ${floor.number}`;

/**
 * Ensures project context uses the route project id.
 */
export const assertProjectContextId = (
  projectId: string,
  contextId: string,
): void => {
  if (contextId !== projectId) {
    throw new BadRequestException(
      "Project canvas contextId must equal projectId",
    );
  }
};
