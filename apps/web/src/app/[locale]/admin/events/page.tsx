import { getLocale, setRequestLocale } from 'next-intl/server';

import { AdminEventsListPage } from '@/features/exhibition/components/admin/admin-events-list-page';

type AdminEventsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminEventsPage({ params }: AdminEventsPageProps) {
  await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  return <AdminEventsListPage />;
}
