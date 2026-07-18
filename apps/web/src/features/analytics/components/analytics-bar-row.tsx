import { barFillColSpanClass } from "@/features/analytics/utils/bar-fill-span";
import { cn } from "@/shared/ui/cn";

type AnalyticsBarRowProps = {
  label: string;
  value: number;
  max: number;
  valueLabel?: string;
};

/**
 * Horizontal bar row using a 10-column grid (no inline width styles).
 */
export const AnalyticsBarRow = ({
  label,
  value,
  max,
  valueLabel,
}: AnalyticsBarRowProps) => {
  const spanClass = barFillColSpanClass(value, max);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-ink-secondary">{label}</span>
        {valueLabel !== "" ? (
          <span className="font-medium text-ink">{valueLabel ?? value}</span>
        ) : null}
      </div>
      <div
        className="grid h-2 grid-cols-10 overflow-hidden rounded-pill bg-border"
        role="presentation"
      >
        {spanClass ? (
          <div className={cn("h-full bg-brand", spanClass)} />
        ) : null}
      </div>
    </div>
  );
};
