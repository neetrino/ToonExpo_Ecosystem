import { getLocale, setRequestLocale } from 'next-intl/server';

import { AdminPublicPagesPage } from '@/features/admin/components/admin-public-pages-page';

type AdminPublicPagesRouteProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Admin route: activate / deactivate public marketing pages.
 */
export default async function AdminPublicPagesRoute({ params }: AdminPublicPagesRouteProps) {
  await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  return <AdminPublicPagesPage />;
}
