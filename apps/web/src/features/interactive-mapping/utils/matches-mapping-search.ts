/**
 * Case-insensitive substring match for mapping picker search.
 */
export const matchesMappingSearch = (query: string, ...parts: Array<string | number | null | undefined>): boolean => {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }
  return parts.some((part) => {
    if (part == null) {
      return false;
    }
    return String(part).toLowerCase().includes(needle);
  });
};
