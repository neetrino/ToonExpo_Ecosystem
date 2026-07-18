import { listBuilders } from "@/features/catalog/api/catalog-api";

import {
  getPortalProject,
  listPortalProjects,
} from "@/features/builder/api/portal-projects-api";

/**
 * Resolves the builder company display name via portal project + public builders.
 * Returns null when the company has no projects yet or lookup fails.
 */
export const resolveBuilderCompanyName = async (
  cookieHeader?: string,
): Promise<string | null> => {
  try {
    const projects = await listPortalProjects(1, 1, { cookieHeader });
    const first = projects.data[0];
    if (!first) {
      return null;
    }

    const detail = await getPortalProject(first.id, { cookieHeader });
    const builders = await listBuilders({ cookieHeader });
    return (
      builders.find((builder) => builder.id === detail.builderCompanyId)
        ?.name ?? null
    );
  } catch {
    return null;
  }
};
