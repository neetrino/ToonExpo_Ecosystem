import type { AdminGeoMapModelItem, AdminProjectListItem } from '@toonexpo/contracts';

export type GeoMapProjectOption = {
  id: string;
  name: string;
  companyName: string;
  /** True when another map model already owns this project (`projectId` unique). */
  hasModel: boolean;
};

/** Builds project picker options; projects with an existing model are flagged. */
export const buildGeoMapProjectOptions = (
  projects: AdminProjectListItem[],
  models: AdminGeoMapModelItem[],
): GeoMapProjectOption[] => {
  const taken = new Set(models.map((model) => model.projectId));
  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    companyName: project.companyName,
    hasModel: taken.has(project.id),
  }));
};

/** Project ids that already have a map model. */
export const collectTakenProjectIds = (models: AdminGeoMapModelItem[]): ReadonlySet<string> =>
  new Set(models.map((model) => model.projectId));
