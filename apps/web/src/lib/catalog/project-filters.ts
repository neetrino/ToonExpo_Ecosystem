import { slugSchema } from '@toonexpo/contracts';
import { z } from 'zod';

export const PROJECT_CITY_FILTER_MAX_LENGTH = 80;

const projectFiltersInputSchema = z.object({
  city: z
    .string()
    .trim()
    .min(1)
    .max(PROJECT_CITY_FILTER_MAX_LENGTH)
    .optional()
    .catch(undefined),
  builder: slugSchema.optional().catch(undefined),
});

export type PublishedProjectFilters = {
  city?: string;
  builderSlug?: string;
};

export type ParsedProjectFilters = PublishedProjectFilters & {
  hasActiveFilters: boolean;
};

/** Parses project list search params; invalid values are stripped. */
export function parseProjectFilters(
  searchParams: Record<string, string | string[] | undefined>,
): ParsedProjectFilters {
  const cityRaw = searchParams.city;
  const builderRaw = searchParams.builder;

  const parsed = projectFiltersInputSchema.safeParse({
    city: typeof cityRaw === 'string' ? cityRaw : undefined,
    builder: typeof builderRaw === 'string' ? builderRaw : undefined,
  });

  if (!parsed.success) {
    return { hasActiveFilters: false };
  }

  const { city, builder } = parsed.data;
  const hasActiveFilters = Boolean(city || builder);

  return {
    city,
    builderSlug: builder,
    hasActiveFilters,
  };
}
