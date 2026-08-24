import type { ProjectListItem } from '@toonexpo/contracts';

import { HERO_KEYWORD_MAX_SUGGESTIONS } from '@/features/catalog/constants/hero-search';
import { buildProjectPublicHref } from '@/features/geo-map/public/utils/build-project-public-href';

export type HeroSearchSuggestionKind = 'project' | 'builder' | 'city';

export type HeroSearchSuggestion = {
  id: string;
  kind: HeroSearchSuggestionKind;
  label: string;
  /** Secondary line (e.g. city under project name). */
  meta: string | null;
  href: string;
};

const normalize = (value: string): string => value.trim().toLocaleLowerCase();

/**
 * Builds ranked hero keyword suggestions from published catalog projects.
 * Order: matching projects, then builders, then cities.
 */
export const buildHeroSearchSuggestions = (
  projects: readonly ProjectListItem[],
  query: string,
): HeroSearchSuggestion[] => {
  const needle = normalize(query);
  if (needle.length === 0) {
    return [];
  }

  const projectsMatched: HeroSearchSuggestion[] = [];
  const buildersMatched: HeroSearchSuggestion[] = [];
  const citiesMatched: HeroSearchSuggestion[] = [];
  const seenBuilders = new Set<string>();
  const seenCities = new Set<string>();

  for (const project of projects) {
    if (normalize(project.name).includes(needle)) {
      projectsMatched.push({
        id: `project:${project.id}`,
        kind: 'project',
        label: project.name,
        meta: project.city?.trim() || project.builder.name,
        href: buildProjectPublicHref(project.slug),
      });
    }

    const builderName = project.builder.name.trim();
    if (builderName.length > 0 && normalize(builderName).includes(needle)) {
      if (!seenBuilders.has(project.builder.id)) {
        seenBuilders.add(project.builder.id);
        buildersMatched.push({
          id: `builder:${project.builder.id}`,
          kind: 'builder',
          label: builderName,
          meta: null,
          href: `/projects?builderId=${encodeURIComponent(project.builder.id)}`,
        });
      }
    }

    const city = project.city?.trim();
    if (city && normalize(city).includes(needle)) {
      const cityKey = normalize(city);
      if (!seenCities.has(cityKey)) {
        seenCities.add(cityKey);
        citiesMatched.push({
          id: `city:${cityKey}`,
          kind: 'city',
          label: city,
          meta: null,
          href: `/projects?city=${encodeURIComponent(city)}`,
        });
      }
    }
  }

  return [...projectsMatched, ...buildersMatched, ...citiesMatched].slice(
    0,
    HERO_KEYWORD_MAX_SUGGESTIONS,
  );
};
