import { setRequestLocale } from 'next-intl/server';

import { AdminAnalyticsClient } from './admin-analytics-client';

type AdminAnalyticsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminAnalyticsPage({ params }: AdminAnalyticsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AdminAnalyticsClient />;
}
