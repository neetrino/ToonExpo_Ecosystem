import { setRequestLocale } from 'next-intl/server';

import { redirect } from '@/i18n/navigation';

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

/**
 * Legacy company catalog new project → admin Projects hub.
 */
export default async function AdminCompanyCatalogNewProjectRedirect({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  redirect({
    href: `/admin/projects/new?companyId=${encodeURIComponent(id)}`,
    locale,
  });
  return null;
}
