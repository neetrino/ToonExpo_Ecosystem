import { ConflictException } from '@nestjs/common';
import { Prisma } from '@toonexpo/db';

export const FLOOR_NUMBER_CONFLICT_MESSAGE =
  'This building already has a floor with this number. Enter a different number or open the existing floor.';

const mentionsFloorNumber = (value: string): boolean => {
  const normalized = value.toLowerCase();
  const hasNumber = normalized.includes('number');
  const hasBuilding = normalized.includes('building_id') || normalized.includes('buildingid');
  return hasNumber && hasBuilding;
};

const constraintHints = (error: Prisma.PrismaClientKnownRequestError): string[] => {
  const hints = [error.message];
  const target = error.meta?.['target'];
  if (Array.isArray(target)) {
    hints.push(target.map((field) => String(field)).join(' '));
  } else if (typeof target === 'string') {
    hints.push(target);
  }
  return hints;
};

const isFloorNumberUniqueViolation = (error: Prisma.PrismaClientKnownRequestError): boolean => {
  if (error.meta?.['modelName'] === 'Floor') {
    return true;
  }
  return constraintHints(error).some(mentionsFloorNumber);
};

/**
 * Maps the floor-number unique constraint to a 409 the UI can show inline.
 * Prisma 7 (driver adapter) reports `modelName: Floor` and omits `meta.target`.
 */
export const rethrowFloorNumberConflict = (error: unknown): void => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') {
    return;
  }
  if (isFloorNumberUniqueViolation(error)) {
    throw new ConflictException(FLOOR_NUMBER_CONFLICT_MESSAGE);
  }
};
