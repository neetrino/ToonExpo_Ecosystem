import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { buildProjectPublicHref } from '@/features/geo-map/public/utils/build-project-public-href';
import { redirect } from '@/i18n/navigation';

type BuildingPageProps = {
  params: Promise<{ locale: string; id: string; buildingId: string }>;
};

export const generateMetadata = async ({ params }: BuildingPageProps): Promise<Metadata> => {
  const { id: projectSlug } = await params;
  return { title: projectSlug };
};

/**
 * Public web has no building page. The building exists only so admin can attach apartments.
 */
export default async function BuildingPage({ params }: BuildingPageProps) {
  const { locale, id: projectSlug } = await params;
  setRequestLocale(locale);
  redirect({ href: buildProjectPublicHref(projectSlug), locale });
}
