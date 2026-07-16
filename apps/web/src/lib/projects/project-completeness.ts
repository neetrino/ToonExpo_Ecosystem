import type { PublicationStatus } from '@toonexpo/domain';

/** Stable checklist keys for project inventory completeness (flag-only in v1). */
export const PROJECT_COMPLETENESS_KEYS = [
  'MISSING_COVER_MEDIA',
  'MISSING_DESCRIPTION',
  'MISSING_PUBLISHED_BUILDING',
  'MISSING_PUBLISHED_FLOOR',
  'MISSING_APARTMENT',
  'MISSING_CANVAS',
] as const;

export type ProjectCompletenessKey = (typeof PROJECT_COMPLETENESS_KEYS)[number];

export type ProjectCompletenessBuildingInput = {
  status: PublicationStatus;
  floors: ReadonlyArray<{
    status: PublicationStatus;
    apartmentCount: number;
  }>;
};

export type ProjectCompletenessInput = {
  description: string | null;
  hasCoverMedia: boolean;
  hasCanvas: boolean;
  buildings: ReadonlyArray<ProjectCompletenessBuildingInput>;
};

export type ProjectCompletenessResult = {
  isComplete: boolean;
  missingKeys: ProjectCompletenessKey[];
};

/**
 * Pure inventory completeness check — does not gate publication in v1.
 */
export function evaluateProjectCompleteness(
  project: ProjectCompletenessInput,
): ProjectCompletenessResult {
  const missingKeys: ProjectCompletenessKey[] = [];

  if (!project.hasCoverMedia) {
    missingKeys.push('MISSING_COVER_MEDIA');
  }
  if (!hasNonEmptyDescription(project.description)) {
    missingKeys.push('MISSING_DESCRIPTION');
  }

  const publishedBuildings = project.buildings.filter((building) => building.status === 'PUBLISHED');
  if (publishedBuildings.length === 0) {
    missingKeys.push('MISSING_PUBLISHED_BUILDING');
  }

  const publishedFloors = publishedBuildings.flatMap((building) =>
    building.floors.filter((floor) => floor.status === 'PUBLISHED'),
  );
  if (publishedFloors.length === 0) {
    missingKeys.push('MISSING_PUBLISHED_FLOOR');
  }

  const hasApartment = publishedFloors.some((floor) => floor.apartmentCount > 0);
  if (!hasApartment) {
    missingKeys.push('MISSING_APARTMENT');
  }

  if (!project.hasCanvas) {
    missingKeys.push('MISSING_CANVAS');
  }

  return {
    isComplete: missingKeys.length === 0,
    missingKeys,
  };
}

function hasNonEmptyDescription(description: string | null): boolean {
  return typeof description === 'string' && description.trim().length > 0;
}
