'use client';

import type { DealStage, RequestSource } from '@toonexpo/domain';
import { DEAL_STAGES } from '@toonexpo/domain';

import { CrmStageSelect } from './crm-stage-select';
import type { CrmDealCardData } from './crm-deal-card';

export type CrmListRowData = CrmDealCardData;

type CrmListProps = {
  locale: string;
  rows: CrmListRowData[];
  labels: {
    unnamedContact: string;
    noProject: string;
    noAssignee: string;
    noActivity: string;
    columns: {
      contact: string;
      project: string;
      stage: string;
      source: string;
      assignee: string;
      apartments: string;
      lastActivity: string;
    };
    stages: Record<DealStage, string>;
    sources: Record<RequestSource, string>;
  };
  onOpenDeal: (dealId: string) => void;
};

export function CrmList({ locale, rows, labels, onOpenDeal }: CrmListProps) {
  return (
    <div className="portal-table-wrap">
      <table className="portal-table crm-list">
        <thead>
          <tr>
            <th>{labels.columns.contact}</th>
            <th>{labels.columns.project}</th>
            <th>{labels.columns.stage}</th>
            <th>{labels.columns.source}</th>
            <th>{labels.columns.assignee}</th>
            <th>{labels.columns.apartments}</th>
            <th>{labels.columns.lastActivity}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <CrmListRow
              key={row.id}
              locale={locale}
              row={row}
              labels={labels}
              onOpenDeal={onOpenDeal}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

type CrmListRowProps = {
  locale: string;
  row: CrmListRowData;
  labels: CrmListProps['labels'];
  onOpenDeal: (dealId: string) => void;
};

function CrmListRow({ locale, row, labels, onOpenDeal }: CrmListRowProps) {
  const rowClassName = row.isFollowUpOverdue
    ? 'crm-list__row crm-list__row--overdue'
    : 'crm-list__row';

  return (
    <tr className={rowClassName}>
      <td>
        <button type="button" className="crm-list__open" onClick={() => onOpenDeal(row.id)}>
          {row.contactName ?? labels.unnamedContact}
        </button>
      </td>
      <td>{row.projectName ?? labels.noProject}</td>
      <td>
        <CrmStageSelect
          locale={locale}
          dealId={row.id}
          currentStage={row.stage}
          stages={DEAL_STAGES}
          compact
        />
      </td>
      <td>{labels.sources[row.source]}</td>
      <td>{row.assigneeName ?? labels.noAssignee}</td>
      <td>{row.apartmentCount}</td>
      <td>{row.lastActivityLabel ?? labels.noActivity}</td>
    </tr>
  );
}
