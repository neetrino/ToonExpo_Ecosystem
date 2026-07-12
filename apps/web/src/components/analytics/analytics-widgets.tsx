import type { NamedShare } from '@/lib/analytics/aggregates';

type AnalyticsStat = {
  key: string;
  label: string;
  value: string;
};

type AnalyticsStatCardsProps = {
  stats: ReadonlyArray<AnalyticsStat>;
};

export function AnalyticsStatCards({ stats }: AnalyticsStatCardsProps) {
  return (
    <div className="analytics-stats">
      {stats.map((stat) => (
        <article key={stat.key} className="analytics-stat">
          <p className="analytics-stat__label">{stat.label}</p>
          <p className="analytics-stat__value">{stat.value}</p>
        </article>
      ))}
    </div>
  );
}

type AnalyticsBarTableProps = {
  title: string;
  emptyLabel: string;
  labelHeader: string;
  countHeader: string;
  rows: ReadonlyArray<NamedShare & { label: string }>;
};

export function AnalyticsBarTable({
  title,
  emptyLabel,
  labelHeader,
  countHeader,
  rows,
}: AnalyticsBarTableProps) {
  return (
    <section className="analytics-section">
      <h3 className="analytics-section__title">{title}</h3>
      {rows.length === 0 ? (
        <p className="analytics-empty">{emptyLabel}</p>
      ) : (
        <div className="portal-table-wrap">
          <table className="portal-table analytics-table">
            <thead>
              <tr>
                <th>{labelHeader}</th>
                <th>{countHeader}</th>
                <th aria-hidden="true" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <td>{row.label}</td>
                  <td>{row.count}</td>
                  <td className="analytics-bar-cell">
                    <div className="analytics-bar" aria-hidden="true">
                      <div className="analytics-bar__fill" style={{ width: `${row.percent}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
