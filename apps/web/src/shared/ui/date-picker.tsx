'use client';

import { CalendarDays } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type FocusEventHandler,
} from 'react';

import { blurActiveElementAfterEscClose } from '@/shared/ui/blur-active-element';
import { cn } from '@/shared/ui/cn';
import {
  buildMonthCells,
  parseIsoDate,
  shiftMonth,
  toIsoDate,
  weekdayLabels,
} from '@/shared/ui/date-picker-utils';
import { DatePickerNav } from '@/shared/ui/date-picker-nav';
import { DropdownPortal } from '@/shared/ui/dropdown-portal';
import {
  isInsideDropdownSurface,
  preventWheelDismissThroughDropdown,
} from '@/shared/ui/dropdown-surface';

export type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  'aria-label': string;
  id?: string | undefined;
  name?: string | undefined;
  disabled?: boolean | undefined;
  className?: string | undefined;
  onBlur?: FocusEventHandler<HTMLButtonElement> | undefined;
};

/**
 * Form date field — same chrome as Select; custom month grid (no native calendar).
 */
export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(function DatePicker(
  { value, onChange, 'aria-label': ariaLabel, id, name, disabled = false, className, onBlur },
  ref,
) {
  const t = useTranslations('Common.datePicker');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const selected = parseIsoDate(value);
  const [viewYear, setViewYear] = useState(() => (selected ?? new Date()).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => (selected ?? new Date()).getMonth());
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const todayIso = toIsoDate(new Date());
  const weekdays = useMemo(() => weekdayLabels(locale), [locale]);
  const cells = useMemo(() => buildMonthCells(viewYear, viewMonth), [viewYear, viewMonth]);
  const monthTitle = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
        new Date(viewYear, viewMonth, 1),
      ),
    [locale, viewYear, viewMonth],
  );
  const displayLabel = selected
    ? new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(selected)
    : t('placeholder');

  useImperativeHandle(ref, () => buttonRef.current as HTMLButtonElement);

  useEffect(() => {
    if (!open) {
      return;
    }
    const next = parseIsoDate(value);
    if (!next) {
      return;
    }
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }, [open, value]);

  useEffect(() => {
    if (!open) {
      return;
    }

    /** Panel lives inside DropdownPortal; scroll/wheel targets the portal wrapper. */
    const isInsidePicker = (node: Node): boolean =>
      isInsideDropdownSurface(node, rootRef.current, panelRef.current);

    const onPointerDown = (event: MouseEvent): void => {
      if (isInsidePicker(event.target as Node)) {
        return;
      }
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setOpen(false);
        blurActiveElementAfterEscClose();
      }
    };

    const onScroll = (event: Event): void => {
      const target = event.target;
      if (target instanceof Node && isInsidePicker(target)) {
        return;
      }
      setOpen(false);
      blurActiveElementAfterEscClose();
    };

    const onWheel = (event: WheelEvent): void => {
      preventWheelDismissThroughDropdown(event, panelRef.current, isInsidePicker);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('wheel', onWheel, { capture: true, passive: false });
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('wheel', onWheel, true);
    };
  }, [open]);

  const pick = (iso: string): void => {
    if (disabled) {
      return;
    }
    onChange(iso);
    setOpen(false);
  };

  const goMonth = (delta: number): void => {
    const next = shiftMonth(viewYear, viewMonth, delta);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const goYear = (delta: number): void => {
    setViewYear(viewYear + delta);
  };

  return (
    <div ref={rootRef} className="relative block w-full min-w-0">
      {name ? <input type="hidden" name={name} value={value} disabled={disabled} /> : null}
      <button
        ref={buttonRef}
        id={id}
        type="button"
        disabled={disabled}
        className={cn(
          'flex h-11 w-full min-w-0 items-center justify-between gap-2 px-4 text-left',
          'rounded-[15px] border border-border bg-surface-elevated',
          'text-base text-ink lg:text-sm',
          'transition-[border-color,box-shadow,background-color] duration-[var(--duration-fast)]',
          'hover:border-border-strong',
          'focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onBlur={onBlur}
        onClick={() => {
          if (disabled) {
            return;
          }
          setOpen((current) => !current);
        }}
      >
        <span className={cn('truncate', !selected && 'text-ink-muted')}>{displayLabel}</span>
        <CalendarDays className="size-4 shrink-0 text-brand" aria-hidden />
      </button>

      <DropdownPortal open={open && !disabled} anchorRef={buttonRef} matchWidth fitContent>
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label={ariaLabel}
          className={cn(
            'w-full min-w-[16.5rem] overflow-hidden p-3',
            'rounded-[12px] border border-header-border bg-surface-elevated shadow-md',
          )}
        >
          <DatePickerNav
            title={monthTitle}
            labels={{
              previousYear: t('previousYear'),
              previousMonth: t('previousMonth'),
              nextMonth: t('nextMonth'),
              nextYear: t('nextYear'),
            }}
            onYearDelta={goYear}
            onMonthDelta={goMonth}
          />

          <div className="mb-1 grid grid-cols-7 gap-0.5">
            {weekdays.map((label, index) => (
              <span
                key={`${label}-${index}`}
                className="py-1 text-center text-[10px] font-medium uppercase tracking-wide text-ink-muted"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((cell) => {
              const isSelected = cell.iso === value;
              const isToday = cell.iso === todayIso;
              return (
                <button
                  key={cell.iso}
                  type="button"
                  className={cn(
                    'flex size-9 items-center justify-center rounded-sm text-sm',
                    'transition-colors duration-[var(--duration-fast)]',
                    cell.inMonth ? 'text-ink' : 'text-ink-muted/50',
                    isSelected ? 'bg-brand-soft font-semibold text-brand-deep' : 'hover:bg-surface',
                    isToday && !isSelected && 'ring-1 ring-brand/35',
                  )}
                  onClick={() => pick(cell.iso)}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <button
              type="button"
              className="text-sm font-medium text-ink-muted transition-colors hover:text-danger"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
            >
              {t('clear')}
            </button>
            <button
              type="button"
              className="text-sm font-medium text-brand-deep transition-colors hover:text-brand"
              onClick={() => pick(todayIso)}
            >
              {t('today')}
            </button>
          </div>
        </div>
      </DropdownPortal>
    </div>
  );
});
