const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAYS_IN_WEEK = 7;
/** Monday-first pad so week rows always fill the grid. */
const CALENDAR_CELL_COUNT = 42;

export type CalendarDayCell = {
  iso: string;
  day: number;
  inMonth: boolean;
};

/** Local calendar date → `YYYY-MM-DD` (no timezone shift). */
export const toIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Parse `YYYY-MM-DD` as a local date; invalid → null. */
export const parseIsoDate = (value: string): Date | null => {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
};

/** Monday-first weekday short labels for the given locale. */
export const weekdayLabels = (locale: string): string[] => {
  const monday = new Date(2024, 0, 1);
  return Array.from({ length: DAYS_IN_WEEK }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(day);
  });
};

/** Month grid cells (6×7), Monday-first, including adjacent-month padding. */
export const buildMonthCells = (year: number, monthIndex: number): CalendarDayCell[] => {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const mondayOffset = (firstOfMonth.getDay() + 6) % DAYS_IN_WEEK;
  const gridStart = new Date(year, monthIndex, 1 - mondayOffset);
  const cells: CalendarDayCell[] = [];

  for (let index = 0; index < CALENDAR_CELL_COUNT; index += 1) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    cells.push({
      iso: toIsoDate(date),
      day: date.getDate(),
      inMonth: date.getMonth() === monthIndex,
    });
  }

  return cells;
};

export const shiftMonth = (year: number, monthIndex: number, delta: number): Date =>
  new Date(year, monthIndex + delta, 1);
