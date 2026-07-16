import type { BuyerFacingStatus } from '@/lib/crm/buyer-facing-status';
import type { BuyerDealRow } from '@/lib/crm/buyer-deals-queries';

type BuyerDealsTableProps = {
  deals: BuyerDealRow[];
  locale: string;
  labels: {
    company: string;
    project: string;
    status: string;
    source: string;
    createdAt: string;
    lastActivityAt: string;
    noValue: string;
  };
  statusLabels: Record<BuyerFacingStatus, string>;
  sourceLabels: Record<BuyerDealRow['source'], string>;
};

function formatDate(value: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

export function BuyerDealsTable({
  deals,
  locale,
  labels,
  statusLabels,
  sourceLabels,
}: BuyerDealsTableProps) {
  return (
    <div className="buyer-deals-table-wrap">
      <table className="buyer-deals-table">
        <thead>
          <tr>
            <th>{labels.company}</th>
            <th>{labels.project}</th>
            <th>{labels.status}</th>
            <th>{labels.source}</th>
            <th>{labels.createdAt}</th>
            <th>{labels.lastActivityAt}</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => (
            <tr key={deal.id}>
              <td>{deal.companyName}</td>
              <td>{deal.projectName ?? labels.noValue}</td>
              <td>{statusLabels[deal.status]}</td>
              <td>{sourceLabels[deal.source]}</td>
              <td>{formatDate(deal.createdAt, locale)}</td>
              <td>
                {deal.lastActivityAt ? formatDate(deal.lastActivityAt, locale) : labels.noValue}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
