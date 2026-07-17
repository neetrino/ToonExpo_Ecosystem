import { setRequestLocale } from 'next-intl/server';

import { AdminExhibitionClient } from './admin-exhibition-client';

type AdminExhibitionPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminExhibitionPage({ params }: AdminExhibitionPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AdminExhibitionClient />;
}
