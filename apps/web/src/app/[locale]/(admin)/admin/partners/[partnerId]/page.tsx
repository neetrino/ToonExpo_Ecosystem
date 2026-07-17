import { setRequestLocale } from 'next-intl/server';

import { AdminPartnerDetailClient } from './admin-partner-detail-client';

type AdminPartnerDetailPageProps = {
  params: Promise<{ locale: string; partnerId: string }>;
};

export default async function AdminPartnerDetailPage({ params }: AdminPartnerDetailPageProps) {
  const { locale, partnerId } = await params;
  setRequestLocale(locale);
  return <AdminPartnerDetailClient partnerId={partnerId} />;
}
