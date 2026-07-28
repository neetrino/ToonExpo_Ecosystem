/**
 * Shareable builders list filters (`?q=`).
 */

export type BuilderListFilters = {
  q: string;
};

const readParam = (
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string => {
  const value = searchParams[key];
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? '';
  }
  return value?.trim() ?? '';
};

/**
 * Parses builders list search params.
 */
export const parseBuilderFilters = (
  searchParams: Record<string, string | string[] | undefined>,
): BuilderListFilters => ({
  q: readParam(searchParams, 'q'),
});

/**
 * Case-insensitive match against free-text builder fields.
 */
export const matchesBuilderSearch = (query: string, fields: readonly string[]): boolean => {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) {
    return true;
  }

  return fields.some((field) => field.toLocaleLowerCase().includes(normalized));
};
