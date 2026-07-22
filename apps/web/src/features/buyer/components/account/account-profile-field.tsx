type AccountProfileFieldProps = {
  label: string;
  value: string;
};

/**
 * Read-only personal information row.
 */
export const AccountProfileField = ({ label, value }: AccountProfileFieldProps) => {
  return (
    <div className="flex flex-col gap-1 border-b border-border/70 pb-3 last:border-b-0 last:pb-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="text-sm font-medium text-ink">{value}</dd>
    </div>
  );
};
