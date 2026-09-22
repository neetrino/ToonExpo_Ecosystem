import { getLocale, setRequestLocale } from 'next-intl/server';

import { AdminHomeBannerPage } from '@/features/admin/components/admin-home-banner-page';

type AdminHomeBannerRouteProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Admin route: configure the public home hero banner image.
 */
export default async function AdminHomeBannerRoute({ params }: AdminHomeBannerRouteProps) {
  await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  return <AdminHomeBannerPage />;
}
