/**
 * Formats optional ISO date strings for exhibition event headers.
 */
export const formatEventDateRange = (
  startDate: string | null,
  endDate: string | null,
  locale: string,
): string | null => {
  if (!startDate && !endDate) {
    return null;
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  if (startDate && endDate) {
    return `${formatter.format(new Date(startDate))} – ${formatter.format(new Date(endDate))}`;
  }

  if (startDate) {
    return formatter.format(new Date(startDate));
  }

  return endDate ? formatter.format(new Date(endDate)) : null;
};
