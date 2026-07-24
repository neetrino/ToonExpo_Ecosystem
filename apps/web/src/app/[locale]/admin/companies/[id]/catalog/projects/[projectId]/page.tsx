import { setRequestLocale } from 'next-intl/server';

import { redirect } from '@/i18n/navigation';

type PageProps = {
  params: Promise<{ locale: string; id: string; projectId: string }>;
};

/**
 * Legacy company catalog project detail → Projects hub.
 */
export default async function AdminCompanyCatalogProjectDetailRedirect({ params }: PageProps) {
  const { locale, projectId } = await params;
  setRequestLocale(locale);
  redirect({ href: `/admin/projects/${projectId}`, locale });
  return null;
}
