import { getLocale, setRequestLocale } from 'next-intl/server';

import { AdminPartnerDetailPage } from '@/features/admin/components/admin-partner-detail-page';

type AdminPartnerDetailRouteProps = {
  params: Promise<{ locale: string; partnerId: string }>;
};

export default async function AdminPartnerDetailRoute({ params }: AdminPartnerDetailRouteProps) {
  const { partnerId } = await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  return <AdminPartnerDetailPage partnerId={partnerId} />;
}
