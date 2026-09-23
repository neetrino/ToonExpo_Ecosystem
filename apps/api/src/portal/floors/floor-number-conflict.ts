import { ConflictException } from '@nestjs/common';
import { Prisma } from '@toonexpo/db';

export const FLOOR_NUMBER_CONFLICT_MESSAGE =
  'This building already has a floor with this number. Enter a different number or open the existing floor.';

const isFloorNumberUniqueViolation = (target: unknown): boolean => {
  if (!Array.isArray(target)) {
    return false;
  }
  const fields = new Set(target.map((field) => String(field)));
  return fields.has('number') && (fields.has('buildingId') || fields.has('building_id'));
};

/**
 * Maps the floor-number unique constraint to a 409 the UI can show inline.
 */
export const rethrowFloorNumberConflict = (error: unknown): void => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
    return;
  }
  if (isFloorNumberUniqueViolation(error.meta?.['target'])) {
    throw new ConflictException(FLOOR_NUMBER_CONFLICT_MESSAGE);
  }
};
