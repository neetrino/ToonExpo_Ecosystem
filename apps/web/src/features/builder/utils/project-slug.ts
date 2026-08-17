import { PORTAL_SLUG_MAX_LENGTH } from '@/features/builder/constants';

/**
 * Builds a URL-safe slug base from a display name (no uniqueness suffix).
 * Matches `apps/api` portal slug base normalization.
 */
export const slugifyProjectName = (name: string): string =>
  name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, PORTAL_SLUG_MAX_LENGTH);

/**
 * Prefers Latin-friendly EN name, then HY, then RU.
 */
export const resolveProjectSlugFromNames = (names: {
  nameEn: string;
  nameHy: string;
  nameRu: string;
}): string => {
  for (const candidate of [names.nameEn, names.nameHy, names.nameRu]) {
    const slug = slugifyProjectName(candidate);
    if (slug.length > 0) {
      return slug;
    }
  }
  return '';
};
