import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AdminAnalyticsView } from '@/components/analytics/admin-analytics-view';
import { loadAdminAnalytics } from '@/lib/analytics/admin-queries';

type AdminAnalyticsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminAnalyticsPage({ params }: AdminAnalyticsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, data] = await Promise.all([getTranslations('admin.analytics'), loadAdminAnalytics()]);

  return <AdminAnalyticsView t={t} data={data} />;
}
