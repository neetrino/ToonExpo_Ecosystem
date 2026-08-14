import type { ReadinessAssessmentListItem } from '@toonexpo/contracts';

export const READINESS_LIST_FIRST_PAGE = 1;

export const parseReadinessListPage = (raw: string | null): number => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < READINESS_LIST_FIRST_PAGE) {
    return READINESS_LIST_FIRST_PAGE;
  }
  return Math.floor(parsed);
};

type ReadinessListHrefParams = {
  page: number;
  companyId?: string;
  projectId?: string;
};

/**
 * Builds `/admin/readiness` URLs with company/project filters and pagination.
 */
export const buildReadinessListHref = (
  pathname: string,
  next: {
    page?: number;
    companyId?: string | null;
    projectId?: string | null;
  },
  current: ReadinessListHrefParams,
): string => {
  const params = new URLSearchParams();
  const companyId =
    next.companyId === undefined ? current.companyId : next.companyId || undefined;
  const projectId =
    next.projectId === undefined ? current.projectId : next.projectId || undefined;
  const page = next.page ?? current.page;

  if (companyId) {
    params.set('companyId', companyId);
  }
  if (projectId) {
    params.set('projectId', projectId);
  }
  if (page > READINESS_LIST_FIRST_PAGE) {
    params.set('page', String(page));
  }

  const query = params.toString();
  return query.length > 0 ? `${pathname}?${query}` : pathname;
};

/**
 * One active project-level assessment per project (latest wins).
 */
export const buildProjectAssessmentMap = (
  assessments: readonly ReadinessAssessmentListItem[],
): Map<string, ReadinessAssessmentListItem> => {
  const map = new Map<string, ReadinessAssessmentListItem>();
  for (const assessment of assessments) {
    if (
      assessment.archivedAt !== null ||
      assessment.targetType !== 'project' ||
      assessment.projectId === null
    ) {
      continue;
    }
    const existing = map.get(assessment.projectId);
    if (!existing || assessment.createdAt > existing.createdAt) {
      map.set(assessment.projectId, assessment);
    }
  }
  return map;
};

type ProjectOption = { id: string };

/**
 * When a project is selected, show only that row; otherwise the current page.
 */
export const resolveVisibleProjects = <T extends ProjectOption>(
  projectId: string | undefined,
  pickerProjects: readonly T[],
  pageProjects: readonly T[],
): T[] => {
  if (!projectId) {
    return [...pageProjects];
  }
  const selected = pickerProjects.find((project) => project.id === projectId);
  return selected ? [selected] : [];
};

