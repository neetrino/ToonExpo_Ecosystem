/**
 * Formats an ISO timestamp for readiness UI lists and headers.
 */
export const formatReadinessDate = (
  iso: string | null,
  locale: string,
): string => {
  if (!iso) {
    return "—";
  }
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
};
