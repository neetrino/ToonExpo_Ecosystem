import type { ProjectListItem } from '@toonexpo/contracts';

/**
 * Unique non-empty city names from catalog projects, locale-sorted.
 */
export const collectProjectCities = (projects: readonly ProjectListItem[]): string[] => {
  const cities = [
    ...new Set(
      projects
        .map((project) => project.city?.trim())
        .filter((city): city is string => Boolean(city)),
    ),
  ];
  return cities.sort((left, right) => left.localeCompare(right));
};

/**
 * Merges catalog cities with popular fallbacks (no duplicates, case-insensitive).
 */
export const mergeLocationOptions = (
  catalogCities: readonly string[],
  popularCities: readonly string[],
): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const city of [...catalogCities, ...popularCities]) {
    const trimmed = city.trim();
    if (trimmed.length === 0) {
      continue;
    }
    const key = trimmed.toLocaleLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(trimmed);
  }

  return result.sort((left, right) => left.localeCompare(right));
};
