import { Card } from "@/shared/ui/card";

type AnalyticsStatCardProps = {
  label: string;
  value: number;
};

/**
 * Compact metric card for analytics dashboards.
 */
export const AnalyticsStatCard = ({ label, value }: AnalyticsStatCardProps) => (
  <Card className="p-4 sm:p-5">
    <p className="text-xs uppercase tracking-wide text-ink-muted">{label}</p>
    <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
  </Card>
);
