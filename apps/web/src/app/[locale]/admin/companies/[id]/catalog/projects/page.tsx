import { setRequestLocale } from 'next-intl/server';

import { redirect } from '@/i18n/navigation';

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

/**
 * Legacy company catalog projects list → admin Projects hub.
 */
export default async function AdminCompanyCatalogProjectsRedirect({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  redirect({ href: `/admin/projects?companyId=${encodeURIComponent(id)}`, locale });
  return null;
}
