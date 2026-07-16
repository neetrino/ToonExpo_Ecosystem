const RELATIVE_TIME_DIVISORS = [
  { unit: 'day' as const, ms: 86_400_000 },
  { unit: 'hour' as const, ms: 3_600_000 },
  { unit: 'minute' as const, ms: 60_000 },
] as const;

/** Short relative label for CRM card activity recency. */
export function formatRelativeActivityAt(date: Date, locale: string, now = new Date()): string {
  const diffMs = date.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  for (const { unit, ms } of RELATIVE_TIME_DIVISORS) {
    if (absMs >= ms || unit === 'minute') {
      const value = Math.round(diffMs / ms);
      return rtf.format(value, unit);
    }
  }

  return rtf.format(0, 'minute');
}

export function formatShortDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

export function formatDateTime(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function isFollowUpOverdue(nextFollowUpAt: Date | null, now = new Date()): boolean {
  return nextFollowUpAt !== null && nextFollowUpAt.getTime() < now.getTime();
}
