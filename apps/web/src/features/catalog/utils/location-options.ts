import type { ProjectListItem } from '@toonexpo/contracts';

/**
 * Same city in EN / HY / RU — one option in the picker; all spellings match in filters.
 * Lookup is case-insensitive via `toLocaleLowerCase()`.
 */
const CITY_ALIAS_GROUPS: readonly (readonly string[])[] = [
  ['Yerevan', 'Երևան', 'Ереван'],
  ['Gyumri', 'Գյումրի', 'Гюмри'],
  ['Vanadzor', 'Վանաձոր', 'Ванадзор'],
  ['Dilijan', 'Դիլիջան', 'Дилижан'],
  ['Tsaghkadzor', 'Ծաղկաձոր', 'Цахкадзор'],
];

const PINNED_GROUP_ID = 'yerevan';

const aliasToGroupId = (() => {
  const map = new Map<string, string>();
  for (const group of CITY_ALIAS_GROUPS) {
    const groupId = group[0]!.toLocaleLowerCase();
    for (const alias of group) {
      map.set(alias.toLocaleLowerCase(), groupId);
    }
  }
  return map;
})();

const findAliasGroup = (city: string): readonly string[] | undefined => {
  const groupId = aliasToGroupId.get(city.trim().toLocaleLowerCase());
  if (!groupId) {
    return undefined;
  }
  return CITY_ALIAS_GROUPS.find((group) => group[0]!.toLocaleLowerCase() === groupId);
};

/** Stable key for dedupe — alias group id or lowercase city. */
export const cityDedupeKey = (city: string): string => {
  const lower = city.trim().toLocaleLowerCase();
  return aliasToGroupId.get(lower) ?? lower;
};

const isPinnedCity = (city: string): boolean => cityDedupeKey(city) === PINNED_GROUP_ID;

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
 * Expands selected cities to all known locale spellings for API `city` equals filters.
 */
export const expandCityFilterValues = (cities: readonly string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const city of cities) {
    const trimmed = city.trim();
    if (trimmed.length === 0) {
      continue;
    }
    const variants = findAliasGroup(trimmed) ?? [trimmed];
    for (const variant of variants) {
      const key = variant.toLocaleLowerCase();
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      result.push(variant);
    }
  }

  return result;
};

/**
 * Unique non-empty city names from catalog projects, locale-sorted.
 * Cross-script aliases (e.g. Yerevan / Երևան) collapse to the first spelling seen.
 */
export const collectProjectCities = (projects: readonly ProjectListItem[]): string[] => {
  const seen = new Set<string>();
  const cities: string[] = [];

  for (const project of projects) {
    const trimmed = project.city?.trim();
    if (!trimmed) {
      continue;
    }
    const key = cityDedupeKey(trimmed);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    cities.push(trimmed);
  }

  return cities.sort(compareLocationOptions);
};

/**
 * Merges catalog cities with popular fallbacks (no duplicates across locale aliases).
 * Popular / UI-locale spellings win; Yerevan stays first; remaining cities are A–Z.
 */
export const mergeLocationOptions = (
  catalogCities: readonly string[],
  popularCities: readonly string[],
): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  // Popular first so the active locale label is kept when catalog uses another script.
  for (const city of [...popularCities, ...catalogCities]) {
    const trimmed = city.trim();
    if (trimmed.length === 0) {
      continue;
    }
    const key = cityDedupeKey(trimmed);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(trimmed);
  }

  return result.sort(compareLocationOptions);
};
