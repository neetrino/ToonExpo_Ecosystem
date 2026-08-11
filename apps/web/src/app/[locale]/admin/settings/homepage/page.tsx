import { setRequestLocale } from 'next-intl/server';

import { AdminHomeBannerPage } from '@/features/admin/components/admin-home-banner-page';

type AdminHomeBannerRouteProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Admin route: configure the public home hero banner image.
 */
export default async function AdminHomeBannerRoute({ params }: AdminHomeBannerRouteProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminHomeBannerPage />;
}
