import type { ProjectListItem } from '@toonexpo/contracts';

import { HOME_FEATURED_PROJECT_LIMIT } from '@/features/catalog/constants/home-featured';

/**
 * Homepage developments band — admin-curated projects first, topped up with catalog
 * projects so the band still fills `HOME_FEATURED_PROJECT_LIMIT` cards when fewer
 * projects are pinned.
 */
export const mergeHomeFeaturedProjects = (
  curated: ProjectListItem[],
  catalog: ProjectListItem[],
): ProjectListItem[] => {
  const merged = [...curated.slice(0, HOME_FEATURED_PROJECT_LIMIT)];
  const usedIds = new Set(merged.map((project) => project.id));

  for (const project of catalog) {
    if (merged.length >= HOME_FEATURED_PROJECT_LIMIT) {
      break;
    }
    if (usedIds.has(project.id)) {
      continue;
    }
    usedIds.add(project.id);
    merged.push(project);
  }

  return merged;
};
