import { getLocale, setRequestLocale } from 'next-intl/server';

import { redirect } from '@/i18n/navigation';

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

/**
 * Legacy company catalog projects list → admin Projects hub.
 */
export default async function AdminCompanyCatalogProjectsRedirect({ params }: PageProps) {
  const { id } = await params;
  const locale = await getLocale();
  setRequestLocale(locale);
  redirect({ href: `/admin/projects?companyId=${encodeURIComponent(id)}`, locale });
  return null;
}
