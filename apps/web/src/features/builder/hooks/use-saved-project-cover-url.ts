'use client';

import { useQueryClient } from '@tanstack/react-query';
import type { AdminProjectListItem, PortalProjectDetail } from '@toonexpo/contracts';

import { ADMIN_PROJECTS_QUERY_KEY } from '@/features/admin/constants';
import { resolvePublicAssetUrl } from '@/shared/lib/static-asset-url';

type AdminProjectsPage = {
  data?: AdminProjectListItem[];
};

export type SavedProjectCover = {
  url: string | null;
  mediaId: string | null;
};

type ListCover = {
  url: string | null;
  mediaId: string | null;
};

const listCoverForProject = (
  pages: Array<[unknown, AdminProjectsPage | undefined]>,
  projectId: string,
): ListCover => {
  for (const [, page] of pages) {
    const item = page?.data?.find((row) => row.id === projectId);
    if (!item?.cover) {
      continue;
    }
    return {
      url: resolvePublicAssetUrl(item.cover.thumbnailUrl ?? item.cover.fileUrl),
      mediaId: item.cover.id,
    };
  }
  return { url: null, mediaId: null };
};

/**
 * Saved project cover for the edit preview — detail payload, then admin list cache.
 */
export const useSavedProjectCover = (project: PortalProjectDetail): SavedProjectCover => {
  const queryClient = useQueryClient();
  const fromDetailUrl = resolvePublicAssetUrl(
    project.cover?.thumbnailUrl ?? project.cover?.fileUrl,
  );
  const fromList = listCoverForProject(
    queryClient.getQueriesData<AdminProjectsPage>({ queryKey: ADMIN_PROJECTS_QUERY_KEY }),
    project.id,
  );

  return {
    url: fromDetailUrl ?? fromList.url,
    mediaId: project.coverMediaId ?? project.cover?.id ?? fromList.mediaId,
  };
};
