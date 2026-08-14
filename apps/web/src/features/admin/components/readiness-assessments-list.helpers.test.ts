import { describe, expect, it } from 'vitest';
import type { ReadinessAssessmentListItem } from '@toonexpo/contracts';

import {
  READINESS_LIST_FIRST_PAGE,
  buildProjectAssessmentMap,
  buildReadinessListHref,
  parseReadinessListPage,
  resolveVisibleProjects,
} from './readiness-assessments-list.helpers';

const assessment = (
  overrides: Partial<ReadinessAssessmentListItem> & Pick<ReadinessAssessmentListItem, 'id'>,
): ReadinessAssessmentListItem => ({
  targetType: 'project',
  builderCompanyId: 'co_1',
  projectId: 'p1',
  projectName: 'Tower',
  coverUrl: null,
  status: 'not_started',
  overallScore: null,
  overallScoreOverridden: false,
  evaluatedByUserId: null,
  lastEvaluatedAt: null,
  archivedAt: null,
  createdAt: '2026-01-02T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  categories: [],
  ...overrides,
});

describe('readiness assessments list helpers', () => {
  it('parses invalid pages as the first page', () => {
    expect(parseReadinessListPage(null)).toBe(READINESS_LIST_FIRST_PAGE);
    expect(parseReadinessListPage('0')).toBe(READINESS_LIST_FIRST_PAGE);
    expect(parseReadinessListPage('3.9')).toBe(3);
  });

  it('builds filter URLs and clears company/project when null', () => {
    expect(
      buildReadinessListHref(
        '/admin/readiness',
        { page: 2, companyId: 'co_1', projectId: 'p1' },
        { page: 1 },
      ),
    ).toBe('/admin/readiness?companyId=co_1&projectId=p1&page=2');

    expect(
      buildReadinessListHref(
        '/admin/readiness',
        { companyId: null, projectId: null, page: 1 },
        { page: 2, companyId: 'co_1', projectId: 'p1' },
      ),
    ).toBe('/admin/readiness');
  });

  it('keeps the latest active project assessment per project', () => {
    const map = buildProjectAssessmentMap([
      assessment({ id: 'old', projectId: 'p1', createdAt: '2026-01-01T00:00:00.000Z' }),
      assessment({ id: 'new', projectId: 'p1', createdAt: '2026-01-03T00:00:00.000Z' }),
      assessment({
        id: 'company',
        targetType: 'builder_company',
        projectId: null,
      }),
      assessment({ id: 'archived', archivedAt: '2026-01-04T00:00:00.000Z' }),
    ]);

    expect(map.size).toBe(1);
    expect(map.get('p1')?.id).toBe('new');
  });

  it('resolves the selected project over the current page', () => {
    const picker = [
      { id: 'p1', name: 'One' },
      { id: 'p2', name: 'Two' },
    ];
    const page = [{ id: 'p1', name: 'One' }];

    expect(resolveVisibleProjects(undefined, picker, page)).toEqual(page);
    expect(resolveVisibleProjects('p2', picker, page)).toEqual([{ id: 'p2', name: 'Two' }]);
    expect(resolveVisibleProjects('missing', picker, page)).toEqual([]);
  });
});
