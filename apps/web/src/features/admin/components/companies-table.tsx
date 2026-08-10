'use client';

import type {
  CompanyResponse,
  ReadinessAssessmentListItem,
  ReadinessScoreStatus,
} from '@toonexpo/contracts';
import { Building2 } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { AdminListCardLogo } from '@/shared/ui/admin-list-card-logo';
import { cn } from '@/shared/ui/cn';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';
import { CompanyStatusBadge } from '@/features/admin/components/company-status-badge';
import { ReadinessProgressRing } from '@/features/readiness/components/readiness-progress-ring';
import { scorePercent, toneForStatus } from '@/features/readiness/utils/readiness-score-display';

const CARD_RADIUS_CLASS = 'rounded-[15px]';
const MEDIA_RADIUS_CLASS = 'rounded-[14px]';
const MEDIA_ASPECT_CLASS = 'aspect-[16/10]';

export type CompanyReadinessSummary = {
  overallScore: number | null;
  status: ReadinessScoreStatus;
  coverUrl: string | null;
};

type CompaniesTableProps = {
  companies: CompanyResponse[];
  readinessByCompanyId?: ReadonlyMap<string, CompanyReadinessSummary> | undefined;
  onSelectCompany: (companyId: string) => void;
  viewMode?: ViewMode | undefined;
};

type ScorePairProps = {
  primary: number | null;
  className?: string | undefined;
};

const ScorePair = ({ primary, className }: ScorePairProps) => {
  if (primary === null) {
    return <span className={cn('tabular-nums text-ink-muted', className)}>—</span>;
  }
  return (
    <span className={cn('font-semibold tracking-tight text-brand tabular-nums', className)}>
      {primary}%
    </span>
  );
};

type CompanyCardProps = {
  company: CompanyResponse;
  readiness: CompanyReadinessSummary | undefined;
  onSelect: () => void;
};

/**
 * KPI-style company card — compact cover + readiness overall score.
 */
const CompanyCard = ({ company, readiness, onSelect }: CompanyCardProps) => {
  const t = useTranslations('Admin.companies');
  const tScore = useTranslations('Admin.readiness.management');
  const initials = company.name.trim().slice(0, 2).toUpperCase() || '—';
  const hasScore = readiness?.overallScore != null;
  const overallPercent = scorePercent(readiness?.overallScore ?? null);
  const tone = toneForStatus(readiness?.status ?? 'not_started');
  const coverUrl = readiness?.coverUrl ?? company.logoUrl;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex h-full w-full flex-col gap-3 overflow-hidden border border-border/80',
        'bg-surface-elevated p-3.5 text-left shadow-card',
        'transition-[box-shadow,transform] duration-[var(--duration-fast)]',
        'hover:shadow-sm active:scale-[0.995]',
        CARD_RADIUS_CLASS,
      )}
    >
      <header className="flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-surface ring-1 ring-border">
              {company.logoUrl ? (
                <Image src={company.logoUrl} alt="" fill className="object-cover" sizes="32px" />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-ink-muted">
                  {initials}
                </span>
              )}
            </div>
            <p className="min-w-0 truncate text-sm font-medium text-ink-secondary">
              {t(`types.${company.type}`)}
            </p>
          </div>
          <CompanyStatusBadge status={company.status} className="shrink-0" />
        </div>
        <h2 className="truncate text-base font-semibold tracking-tight text-ink">{company.name}</h2>
      </header>

      <div
        className={cn(
          'relative w-full overflow-hidden bg-surface ring-1 ring-border/60',
          MEDIA_ASPECT_CLASS,
          MEDIA_RADIUS_CLASS,
        )}
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
          />
        ) : (
          <span className="flex size-full flex-col items-center justify-center gap-1.5 text-ink-muted">
            <Building2 className="size-8 opacity-40" aria-hidden />
            <span className="max-w-[80%] truncate text-xs">{company.name}</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <ReadinessProgressRing
          percent={overallPercent}
          size="sm"
          tone={tone}
          showValue={false}
          className="size-11"
          label={`${tScore('overallScore')}: ${hasScore ? `${overallPercent}%` : '—'}`}
        />
        <p className="min-w-0 flex-1 text-sm leading-snug text-ink-secondary">
          {tScore('overallScore')}
        </p>
        <ScorePair primary={hasScore ? overallPercent : null} className="text-lg" />
      </div>
    </button>
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
      status: assessment.status,
      coverUrl: assessment.coverUrl,
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
                  <AdminListCardLogo name={company.name} logoUrl={company.logoUrl} shape="circle" />
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
  );
};
