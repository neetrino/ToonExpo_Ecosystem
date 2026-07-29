import type { ProjectListItem } from '@toonexpo/contracts';

/** Canonical / localized names for the capital — always listed first. */
const PINNED_CITY_KEYS = new Set(['yerevan', 'երևան', 'ереван']);

const isPinnedCity = (city: string): boolean =>
  PINNED_CITY_KEYS.has(city.trim().toLocaleLowerCase());

/**
 * Alphabetical order with Yerevan (any locale spelling) pinned to the top.
 */
export const compareLocationOptions = (left: string, right: string): number => {
  const leftPinned = isPinnedCity(left);
  const rightPinned = isPinnedCity(right);
  if (leftPinned !== rightPinned) {
    return leftPinned ? -1 : 1;
  }
  return left.localeCompare(right);
};

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
  return cities.sort(compareLocationOptions);
};

/**
 * Merges catalog cities with popular fallbacks (no duplicates, case-insensitive).
 * Yerevan stays first; remaining cities are A–Z.
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

  return result.sort(compareLocationOptions);
};
