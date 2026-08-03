import type { AdminGeoMapModelItem, AdminProjectListItem } from '@toonexpo/contracts';

export type GeoMapProjectOption = {
  id: string;
  name: string;
  companyName: string;
  /** True when another map model already owns this project (`projectId` unique). */
  hasModel: boolean;
};

const attachedProjectIds = (models: AdminGeoMapModelItem[]): Set<string> => {
  const taken = new Set<string>();
  for (const model of models) {
    if (model.projectId) {
      taken.add(model.projectId);
    }
  }
  return taken;
};

/** Builds project picker options; projects with an existing model are flagged. */
export const buildGeoMapProjectOptions = (
  projects: AdminProjectListItem[],
  models: AdminGeoMapModelItem[],
): GeoMapProjectOption[] => {
  const taken = attachedProjectIds(models);
  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    companyName: project.companyName,
    hasModel: taken.has(project.id),
  }));
};

/** Project ids that already have a map model. */
export const collectTakenProjectIds = (models: AdminGeoMapModelItem[]): ReadonlySet<string> =>
  attachedProjectIds(models);
