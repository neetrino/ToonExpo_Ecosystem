'use client';

import type { ReadinessStatus, ReadinessTargetType } from '@toonexpo/domain';

import { Link } from '@/i18n/navigation';
import type { AdminAssessmentListRow } from '@/lib/admin/readiness-queries';

type ReadinessTableProps = {
  assessments: AdminAssessmentListRow[];
  labels: {
    columns: {
      target: string;
      score: string;
      status: string;
      evaluator: string;
      updatedAt: string;
      actions: string;
    };
    edit: string;
    noEvaluator: string;
  };
  statusLabels: Record<ReadinessStatus, string>;
  targetLabels: Record<ReadinessTargetType, string>;
  formatDate: (date: Date) => string;
};

function targetLabel(
  row: AdminAssessmentListRow,
  targetLabels: Record<ReadinessTargetType, string>,
): string {
  if (row.targetType === 'PROJECT') {
    return `${targetLabels.PROJECT}: ${row.projectName ?? row.companyName}`;
  }
  return `${targetLabels.BUILDER_COMPANY}: ${row.companyName}`;
}

export function ReadinessTable({
  assessments,
  labels,
  statusLabels,
  targetLabels,
  formatDate,
}: ReadinessTableProps) {
  return (
    <div className="portal-table-wrap">
      <table className="portal-table">
        <thead>
          <tr>
            <th>{labels.columns.target}</th>
            <th>{labels.columns.score}</th>
            <th>{labels.columns.status}</th>
            <th>{labels.columns.evaluator}</th>
            <th>{labels.columns.updatedAt}</th>
            <th>{labels.columns.actions}</th>
          </tr>
        </thead>
        <tbody>
          {assessments.map((row) => (
            <tr key={row.id}>
              <td>{targetLabel(row, targetLabels)}</td>
              <td>{row.overallScore ?? '—'}</td>
              <td>
                <span className="portal-badge">{statusLabels[row.status]}</span>
              </td>
              <td>{row.evaluatorEmail ?? labels.noEvaluator}</td>
              <td>{formatDate(row.updatedAt)}</td>
              <td>
                <Link
                  className="portal-btn portal-btn--ghost portal-btn--sm"
                  href={`/admin/readiness?edit=${row.id}`}
                >
                  {labels.edit}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
