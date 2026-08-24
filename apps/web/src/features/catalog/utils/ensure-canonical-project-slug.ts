import { redirect } from '@/i18n/navigation';

type ProjectSlugRef = {
  slug: string;
};

/**
 * Redirects legacy `/projects/{id}` URLs to the canonical slug route.
 */
export const ensureCanonicalProjectSlug = (
  project: ProjectSlugRef,
  projectSlug: string,
  locale: string,
  pathSuffix = '',
): void => {
  if (project.slug === projectSlug) {
    return;
  }

  redirect({
    href: `/projects/${encodeURIComponent(project.slug)}${pathSuffix}`,
    locale,
  });
};
