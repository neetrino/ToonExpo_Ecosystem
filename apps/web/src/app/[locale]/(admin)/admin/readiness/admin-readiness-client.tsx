'use client';

import type { AdminReadinessAssessment } from '@toonexpo/contracts';
import type { ReadinessStatus, ReadinessTargetType } from '@toonexpo/domain';
import { READINESS_STATUSES, READINESS_TARGET_TYPES } from '@toonexpo/domain';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { DataRefreshProvider } from '@/components/portal-forms/data-refresh-context';
import {
  getAdminAssessment,
  listAdminAssessments,
  listAdminReadinessCategories,
  loadActiveReadinessCategories,
  loadAdminCompanyOptions,
  loadAdminProjectOptions,
  type AdminAssessmentListRow,
  type AdminReadinessCategoryRow,
  type AdminTargetOption,
  type ReadinessCategoryOption,
} from '@/lib/admin/readiness-queries';

import { CategoriesTable } from './categories-table';
import { NewAssessmentButton } from './new-assessment-button';
import { NewCategoryButton } from './new-category-button';
import { ReadinessTable } from './readiness-table';
import { TargetTypeFilter } from './target-type-filter';

function parseTargetFilter(raw: string | null): ReadinessTargetType | undefined {
  if (raw && (READINESS_TARGET_TYPES as readonly string[]).includes(raw)) {
    return raw as ReadinessTargetType;
  }
  return undefined;
}

type ReadinessPageData = {
  assessments: AdminAssessmentListRow[];
  activeCategories: ReadinessCategoryOption[];
  allCategories: AdminReadinessCategoryRow[];
  companies: AdminTargetOption[];
  projects: AdminTargetOption[];
  editAssessment: AdminReadinessAssessment | null;
};

export function AdminReadinessClient() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const targetFilter = parseTargetFilter(searchParams.get('target'));
  const editId = searchParams.get('edit');
  const t = useTranslations('admin.readiness');
  const tStatus = useTranslations('admin.readiness.statuses');
  const tTarget = useTranslations('admin.readiness.targets');
  const [data, setData] = useState<ReadinessPageData | null>(null);

  const loadReadiness = useCallback(async () => {
    const [assessments, activeCategories, allCategories, companies, projects, editAssessment] =
      await Promise.all([
        listAdminAssessments(targetFilter),
        loadActiveReadinessCategories(),
        listAdminReadinessCategories(),
        loadAdminCompanyOptions(),
        loadAdminProjectOptions(),
        editId ? getAdminAssessment(editId) : Promise.resolve(null),
      ]);
    setData({
      assessments,
      activeCategories,
      allCategories,
      companies,
      projects,
      editAssessment,
    });
  }, [editId, targetFilter]);

  useEffect(() => {
    setData(null);
    void loadReadiness();
  }, [loadReadiness]);

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-[var(--te-muted)]" role="status">
        Loading…
      </div>
    );
  }

  const statusLabels = Object.fromEntries(
    READINESS_STATUSES.map((status) => [status, tStatus(status)]),
  ) as Record<ReadinessStatus, string>;

  const targetLabels = Object.fromEntries(
    READINESS_TARGET_TYPES.map((type) => [type, tTarget(type)]),
  ) as Record<ReadinessTargetType, string>;

  return (
    <DataRefreshProvider refresh={loadReadiness}>
      <section>
        <div className="portal-page__header">
          <h2 className="portal-page__title">{t('title')}</h2>
          <div className="portal-toolbar">
            <NewCategoryButton locale={locale} label={t('newCategory')} />
            <NewAssessmentButton
              locale={locale}
              label={t('newAssessment')}
              categories={data.activeCategories}
              companies={data.companies}
              projects={data.projects}
              editAssessment={data.editAssessment}
            />
          </div>
        </div>

        <h3 className="portal-section__title">{t('categoriesTitle')}</h3>
        {data.allCategories.length === 0 ? (
          <p className="portal-empty">{t('categoriesEmpty')}</p>
        ) : (
          <CategoriesTable
            locale={locale}
            categories={data.allCategories}
            labels={{
              columns: {
                name: t('categoryColumns.name'),
                key: t('categoryColumns.key'),
                weight: t('categoryColumns.weight'),
                sortOrder: t('categoryColumns.sortOrder'),
                serviceCategoryKey: t('categoryColumns.serviceCategoryKey'),
                active: t('categoryColumns.active'),
                updatedAt: t('categoryColumns.updatedAt'),
                actions: t('categoryColumns.actions'),
              },
              edit: t('edit'),
              activeYes: t('activeYes'),
              activeNo: t('activeNo'),
              emptyValue: t('noEvaluator'),
            }}
          />
        )}

        <h3 className="portal-section__title">{t('assessmentsTitle')}</h3>
        <TargetTypeFilter
          currentType={targetFilter}
          labels={{
            all: t('filter.all'),
            ariaLabel: t('filter.ariaLabel'),
            ...targetLabels,
          }}
        />

        {data.assessments.length === 0 ? (
          <p className="portal-empty">{t('empty')}</p>
        ) : (
          <ReadinessTable
            locale={locale}
            assessments={data.assessments}
            labels={{
              columns: {
                target: t('columns.target'),
                score: t('columns.score'),
                status: t('columns.status'),
                evaluator: t('columns.evaluator'),
                updatedAt: t('columns.updatedAt'),
                actions: t('columns.actions'),
              },
              edit: t('edit'),
              noEvaluator: t('noEvaluator'),
            }}
            statusLabels={statusLabels}
            targetLabels={targetLabels}
          />
        )}
      </section>
    </DataRefreshProvider>
  );
}
