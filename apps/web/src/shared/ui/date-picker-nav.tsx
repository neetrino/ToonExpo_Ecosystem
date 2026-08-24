import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const CALENDAR_NAV_BUTTON_CLASS =
  'flex size-8 items-center justify-center rounded-sm text-ink-muted transition-colors hover:bg-surface hover:text-brand-deep';

type DatePickerNavLabels = {
  previousYear: string;
  previousMonth: string;
  nextMonth: string;
  nextYear: string;
};

type DatePickerNavProps = {
  title: string;
  labels: DatePickerNavLabels;
  onYearDelta: (delta: number) => void;
  onMonthDelta: (delta: number) => void;
};

/**
 * Month/year stepper for the shared date picker calendar.
 */
export const DatePickerNav = ({
  title,
  labels,
  onYearDelta,
  onMonthDelta,
}: DatePickerNavProps) => (
  <div className="mb-2 flex items-center justify-between gap-1">
    <div className="flex items-center">
      <button
        type="button"
        className={CALENDAR_NAV_BUTTON_CLASS}
        aria-label={labels.previousYear}
        onClick={() => onYearDelta(-1)}
      >
        <ChevronsLeft className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        className={CALENDAR_NAV_BUTTON_CLASS}
        aria-label={labels.previousMonth}
        onClick={() => onMonthDelta(-1)}
      >
        <ChevronLeft className="size-4" aria-hidden />
      </button>
    </div>
    <p className="min-w-0 flex-1 text-center text-sm font-semibold capitalize text-ink">{title}</p>
    <div className="flex items-center">
      <button
        type="button"
        className={CALENDAR_NAV_BUTTON_CLASS}
        aria-label={labels.nextMonth}
        onClick={() => onMonthDelta(1)}
      >
        <ChevronRight className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        className={CALENDAR_NAV_BUTTON_CLASS}
        aria-label={labels.nextYear}
        onClick={() => onYearDelta(1)}
      >
        <ChevronsRight className="size-4" aria-hidden />
      </button>
    </div>
  </div>
);
