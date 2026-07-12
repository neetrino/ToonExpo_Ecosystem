import type { ReadinessStatus, ReadinessTargetType } from '@toonexpo/domain';
import { READINESS_STATUSES, READINESS_TARGET_TYPES } from '@toonexpo/domain';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import {
  getAdminAssessment,
  listAdminAssessments,
  loadActiveReadinessCategories,
  loadAdminCompanyOptions,
  loadAdminProjectOptions,
} from '@/lib/admin/readiness-queries';

import { NewAssessmentButton } from './new-assessment-button';
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

  const [t, tStatus, tTarget, assessments, categories, companies, projects, editAssessment] =
    await Promise.all([
      getTranslations('admin.readiness'),
      getTranslations('admin.readiness.statuses'),
      getTranslations('admin.readiness.targets'),
      listAdminAssessments(targetFilter),
      loadActiveReadinessCategories(),
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
          <NewAssessmentButton
            locale={locale}
            label={t('newAssessment')}
            categories={categories}
            companies={companies}
            projects={projects}
            editAssessment={editAssessment}
          />
        </div>
      </div>

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
