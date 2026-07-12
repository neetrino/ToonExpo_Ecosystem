import type { ReadinessStatus, ReadinessTargetType } from '@toonexpo/domain';
import { READINESS_STATUSES, READINESS_TARGET_TYPES } from '@toonexpo/domain';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import {
  getAdminAssessment,
  listAdminAssessments,
  listAdminReadinessCategories,
  loadActiveReadinessCategories,
  loadAdminCompanyOptions,
  loadAdminProjectOptions,
} from '@/lib/admin/readiness-queries';

import { CategoriesTable } from './categories-table';
import { NewAssessmentButton } from './new-assessment-button';
import { NewCategoryButton } from './new-category-button';
import { ReadinessTable } from './readiness-table';
import { TargetTypeFilter } from './target-type-filter';

type AdminReadinessPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ target?: string; edit?: string }>;
};

function parseTargetFilter(raw: string | undefined): ReadinessTargetType | undefined {
  if (raw && (READINESS_TARGET_TYPES as readonly string[]).includes(raw)) {
    return raw as ReadinessTargetType;
  }
  return undefined;
}

export default async function AdminReadinessPage({
  params,
  searchParams,
}: AdminReadinessPageProps) {
  const { locale } = await params;
  const { target: rawTarget, edit: editId } = await searchParams;
  setRequestLocale(locale);

  const targetFilter = parseTargetFilter(rawTarget);

  const [
    t,
    tStatus,
    tTarget,
    assessments,
    activeCategories,
    allCategories,
    companies,
    projects,
    editAssessment,
  ] = await Promise.all([
    getTranslations('admin.readiness'),
    getTranslations('admin.readiness.statuses'),
    getTranslations('admin.readiness.targets'),
    listAdminAssessments(targetFilter),
    loadActiveReadinessCategories(),
    listAdminReadinessCategories(),
    loadAdminCompanyOptions(),
    loadAdminProjectOptions(),
    editId ? getAdminAssessment(editId) : Promise.resolve(null),
  ]);

  const statusLabels = Object.fromEntries(
    READINESS_STATUSES.map((status) => [status, tStatus(status)]),
  ) as Record<ReadinessStatus, string>;

  const targetLabels = Object.fromEntries(
    READINESS_TARGET_TYPES.map((type) => [type, tTarget(type)]),
  ) as Record<ReadinessTargetType, string>;

  return (
    <section>
      <div className="portal-page__header">
        <h2 className="portal-page__title">{t('title')}</h2>
        <div className="portal-toolbar">
          <NewCategoryButton locale={locale} label={t('newCategory')} />
          <NewAssessmentButton
            locale={locale}
            label={t('newAssessment')}
            categories={activeCategories}
            companies={companies}
            projects={projects}
            editAssessment={editAssessment}
          />
        </div>
      </div>

      <h3 className="portal-section__title">{t('categoriesTitle')}</h3>
      {allCategories.length === 0 ? (
        <p className="portal-empty">{t('categoriesEmpty')}</p>
      ) : (
        <CategoriesTable
          locale={locale}
          categories={allCategories}
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

      {assessments.length === 0 ? (
        <p className="portal-empty">{t('empty')}</p>
      ) : (
        <ReadinessTable
          locale={locale}
          assessments={assessments}
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
  );
}
