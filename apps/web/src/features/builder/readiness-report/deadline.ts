export type DeadlineOutcome =
  | 'COMPLETED_ON_TIME'
  | 'COMPLETED_LATE'
  | 'COMPLETED_NO_DEADLINE'
  | 'COMPLETION_DATE_UNKNOWN'
  | 'OVERDUE'
  | 'PENDING'
  | 'NO_DEADLINE';

const YEREVAN = 'Asia/Yerevan';
const DAY_MS = 86_400_000;
const DUE_SOON_DAYS = 7;

/** Calendar day in Armenia, so a deadline does not shift across the UTC boundary. */
export const yerevanDateKey = (value: Date): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: YEREVAN,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(value);

const daySpan = (earlier: string, later: string): number =>
  Math.round((Date.parse(`${later}T00:00:00Z`) - Date.parse(`${earlier}T00:00:00Z`)) / DAY_MS);

export type DeadlineFacts = {
  outcome: DeadlineOutcome;
  lateDays: number | null;
  dueSoon: boolean;
};

/**
 * Same deadline outcomes as the client progress report.
 * `dueDate` is a YYYY-MM-DD calendar day. `completedAt` is an ISO timestamp.
 */
export const deadlineFacts = (
  input: { done: boolean; dueDate: string | null; completedAt: string | null },
  now = new Date(),
): DeadlineFacts => {
  if (input.done) {
    if (!input.dueDate) {
      return { outcome: 'COMPLETED_NO_DEADLINE', lateDays: null, dueSoon: false };
    }
    if (!input.completedAt) {
      return { outcome: 'COMPLETION_DATE_UNKNOWN', lateDays: null, dueSoon: false };
    }
    const lateDays = Math.max(
      0,
      daySpan(input.dueDate, yerevanDateKey(new Date(input.completedAt))),
    );
    return {
      outcome: lateDays > 0 ? 'COMPLETED_LATE' : 'COMPLETED_ON_TIME',
      lateDays,
      dueSoon: false,
    };
  }

  if (!input.dueDate) {
    return { outcome: 'NO_DEADLINE', lateDays: null, dueSoon: false };
  }

  const today = yerevanDateKey(now);
  if (input.dueDate < today) {
    return { outcome: 'OVERDUE', lateDays: daySpan(input.dueDate, today), dueSoon: false };
  }

  const untilDue = daySpan(today, input.dueDate);
  return { outcome: 'PENDING', lateDays: 0, dueSoon: untilDue <= DUE_SOON_DAYS };
};
