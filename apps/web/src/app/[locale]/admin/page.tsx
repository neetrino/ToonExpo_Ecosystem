import { getLocale, setRequestLocale } from 'next-intl/server';

import { AdminHomePage } from '@/features/admin/components/admin-home-page';

type AdminIndexPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Admin portal hub — mobile profile stack; desktop sidebar landing.
 */
export default async function AdminIndexPage({ params }: AdminIndexPageProps) {
  await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  return <AdminHomePage />;
}
