import type { NamedCount } from '@/lib/analytics/aggregates';
import { toPercentageShares } from '@/lib/analytics/aggregates';
import type { CheckInEventCount, ReadinessCompanyAverage } from '@/lib/analytics/admin-queries';
import type { BuilderReadinessSnapshotRow, ProjectViewRow } from '@/lib/analytics/builder-queries';

type TranslateFn = {
  (key: string): string;
  has: (key: string) => boolean;
};

export type LabeledShareRow = {
  key: string;
  count: number;
  percent: number;
  label: string;
};

function translateKey(t: TranslateFn, prefix: string, key: string): string {
  const path = `${prefix}.${key}`;
  return t.has(path) ? t(path) : key;
}

export function labeledSharesFromCounts(
  rows: ReadonlyArray<NamedCount>,
  t: TranslateFn,
  prefix: string,
): LabeledShareRow[] {
  return toPercentageShares(rows).map((row) => ({
    ...row,
    label: translateKey(t, prefix, row.key),
  }));
}

export function labeledSharesFromEvents(
  events: ReadonlyArray<CheckInEventCount>,
): LabeledShareRow[] {
  return toPercentageShares(
    events.map((event) => ({ key: event.eventId, count: event.count })),
  ).map((row) => ({
    ...row,
    label: events.find((event) => event.eventId === row.key)?.eventName ?? row.key,
  }));
}

export function labeledSharesFromReadinessAverages(
  companies: ReadonlyArray<ReadinessCompanyAverage>,
): LabeledShareRow[] {
  return toPercentageShares(
    companies.map((company) => ({
      key: company.companyId,
      count: Math.round(company.avgScore ?? 0),
    })),
  ).map((row) => {
    const match = companies.find((company) => company.companyId === row.key);
    return {
      ...row,
      label: match ? `${match.companyName} (${match.avgScore?.toFixed(1) ?? '—'})` : row.key,
    };
  });
}

export function labeledSharesFromProjectViews(
  projects: ReadonlyArray<ProjectViewRow>,
): LabeledShareRow[] {
  return toPercentageShares(
    projects.map((project) => ({ key: project.projectId, count: project.total })),
  ).map((row) => ({
    ...row,
    label: projects.find((project) => project.projectId === row.key)?.projectName ?? row.key,
  }));
}

export function labeledSharesFromBuilderReadiness(
  rows: ReadonlyArray<BuilderReadinessSnapshotRow>,
  companyLabel: string,
): LabeledShareRow[] {
  return toPercentageShares(rows.map((row) => ({ key: row.id, count: row.overallScore ?? 0 }))).map(
    (row) => {
      const match = rows.find((item) => item.id === row.key);
      const base = match?.label === 'BUILDER_COMPANY' ? companyLabel : (match?.label ?? row.key);
      const score = match?.overallScore;
      return {
        ...row,
        label: score === null || score === undefined ? base : `${base} (${score})`,
      };
    },
  );
}
