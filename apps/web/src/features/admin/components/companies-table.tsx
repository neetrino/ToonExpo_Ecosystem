'use client';

import type {
  CompanyResponse,
  ReadinessAssessmentCategorySummary,
  ReadinessAssessmentListItem,
} from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { CompanyStatusBadge } from '@/features/admin/components/company-status-badge';
import {
  ReadinessKpiCard,
  type ReadinessKpiCategoryRow,
} from '@/features/readiness/components/readiness-kpi-card';
import { scorePercent } from '@/features/readiness/utils/readiness-score-display';
import { resolvePublicAssetUrl } from '@/shared/lib/static-asset-url';
import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { AdminListCardLogo } from '@/shared/ui/admin-list-card-logo';
import { ListTableReveal } from '@/shared/ui/motion';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';

export type CompanyReadinessSummary = {
  overallScore: number | null;
  coverUrl: string | null;
  categories: ReadinessAssessmentCategorySummary[];
};

type CompaniesTableProps = {
  companies: CompanyResponse[];
  readinessByCompanyId?: ReadonlyMap<string, CompanyReadinessSummary> | undefined;
  onSelectCompany: (companyId: string) => void;
  viewMode?: ViewMode | undefined;
};

const toKpiCategories = (
  categories: readonly ReadinessAssessmentCategorySummary[],
): ReadinessKpiCategoryRow[] =>
  categories.map((category) => ({
    id: category.categoryId,
    code: category.categoryCode,
    percent: scorePercent(category.score),
    hasScore: category.score !== null,
  }));

type CompanyCardProps = {
  company: CompanyResponse;
  readiness: CompanyReadinessSummary | undefined;
  onSelect: () => void;
};

/**
 * KPI-style company card — cover, colorful rings, category scores.
 */
const CompanyCard = ({ company, readiness, onSelect }: CompanyCardProps) => {
  const t = useTranslations('Admin.companies');
  const tScore = useTranslations('Admin.readiness.management');
  const tKpi = useTranslations('ReadinessKpi');
  const overallPercent = scorePercent(readiness?.overallScore ?? null);
  const hasScore = readiness?.overallScore != null;

  return (
    <ReadinessKpiCard
      companyName={t(`types.${company.type}`)}
      companyLogoUrl={company.logoUrl}
      title={company.name}
      coverUrl={company.coverUrl ?? readiness?.coverUrl ?? company.logoUrl}
      overallPercent={overallPercent}
      overallHasScore={hasScore}
      overallLabel={tScore('overallScore')}
      categories={toKpiCategories(readiness?.categories ?? [])}
      categoryLabel={(code) => tKpi(`categories.${code}`)}
      onClick={onSelect}
      headerTrailing={<CompanyStatusBadge status={company.status} className="shrink-0" />}
    />
  );
};

/**
 * Builds a company → latest company-level readiness summary map.
 */
export const buildCompanyReadinessMap = (
  assessments: readonly ReadinessAssessmentListItem[],
): Map<string, CompanyReadinessSummary> => {
  const map = new Map<string, CompanyReadinessSummary>();
  for (const assessment of assessments) {
    if (assessment.targetType !== 'builder_company') {
      continue;
    }
    if (map.has(assessment.builderCompanyId)) {
      continue;
    }
    map.set(assessment.builderCompanyId, {
      overallScore: assessment.overallScore,
      coverUrl: assessment.coverUrl,
      categories: assessment.categories,
    });
  }
  return map;
};

/**
 * Companies collection as KPI cards or dense table for platform admin.
 */
export const CompaniesTable = ({
  companies,
  readinessByCompanyId,
  onSelectCompany,
  viewMode = VIEW_MODE_CARDS,
}: CompaniesTableProps) => {
  const t = useTranslations('Admin.companies');

  if (viewMode === VIEW_MODE_CARDS) {
    return (
      <AdminListCardGrid className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {companies.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            readiness={readinessByCompanyId?.get(company.id)}
            onSelect={() => {
              onSelectCompany(company.id);
            }}
          />
        ))}
      </AdminListCardGrid>
    );
  }

  return (
    <ListTableReveal>
      <div className="overflow-x-auto rounded-sm border border-border">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-3 py-2.5 text-left font-medium">{t('columns.name')}</th>
              <th className="px-3 py-2.5 text-center font-medium">{t('columns.type')}</th>
              <th className="px-3 py-2.5 text-center font-medium">{t('columns.status')}</th>
              <th className="px-3 py-2.5 text-right font-medium">{t('columns.createdAt')}</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id} className="border-t border-border hover:bg-surface/60">
                <td className="px-3 py-2.5 align-middle">
                  <div className="flex items-center gap-3">
                    <AdminListCardLogo
                      name={company.name}
                      logoUrl={resolvePublicAssetUrl(company.logoUrl)}
                      shape="circle"
                    />
                    <button
                      type="button"
                      className="font-medium text-brand hover:underline"
                      onClick={() => {
                        onSelectCompany(company.id);
                      }}
                    >
                      {company.name}
                    </button>
                  </div>
                </td>
                <td className="px-3 py-2.5 align-middle text-center text-ink-secondary">
                  {t(`types.${company.type}`)}
                </td>
                <td className="px-3 py-2.5 align-middle">
                  <div className="flex justify-center">
                    <CompanyStatusBadge status={company.status} />
                  </div>
                </td>
                <td className="px-3 py-2.5 align-middle text-right tabular-nums text-ink-secondary whitespace-nowrap">
                  {company.createdAt.slice(0, 10)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ListTableReveal>
  );
};
