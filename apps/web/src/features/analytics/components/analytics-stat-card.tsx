import { Card } from '@/shared/ui/card';
import { cn } from '@/shared/ui/cn';

type AnalyticsStatCardProps = {
  label: string;
  value: number;
  className?: string | undefined;
};

/**
 * Compact metric card for analytics dashboards.
 */
export const AnalyticsStatCard = ({ label, value, className }: AnalyticsStatCardProps) => (
  <Card
    className={cn(
      'p-4 sm:p-5',
      'transition-[translate,box-shadow] duration-[750ms]',
      'ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
      'hover:-translate-y-1 hover:shadow-md',
      'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
      className,
    )}
  >
    <p className="text-xs uppercase tracking-wide text-ink-muted">{label}</p>
    <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
  </Card>
);
