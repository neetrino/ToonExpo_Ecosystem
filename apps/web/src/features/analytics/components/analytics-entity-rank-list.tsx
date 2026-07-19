type AnalyticsEntityRankListProps = {
  items: { entityId: string; name: string | null; viewCount: number }[];
  rankLabel: string;
  nameLabel: string;
  viewsLabel: string;
  emptyLabel: string;
};

/**
 * Compact ranked table for top entities by view count.
 */
export const AnalyticsEntityRankList = ({
  items,
  rankLabel,
  nameLabel,
  viewsLabel,
  emptyLabel,
}: AnalyticsEntityRankListProps) => {
  if (items.length === 0) {
    return <p className="text-sm text-ink-secondary">{emptyLabel}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase text-ink-muted">
            <th className="px-2 py-2">{rankLabel}</th>
            <th className="px-2 py-2">{nameLabel}</th>
            <th className="px-2 py-2 text-right">{viewsLabel}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={item.entityId}
              className="border-b border-border last:border-0"
            >
              <td className="px-2 py-2 text-ink-muted">{index + 1}</td>
              <td className="px-2 py-2 text-ink">
                {item.name?.trim() || "—"}
              </td>
              <td className="px-2 py-2 text-right font-medium text-ink">
                {item.viewCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
