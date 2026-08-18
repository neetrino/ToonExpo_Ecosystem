import { setRequestLocale } from 'next-intl/server';

import { redirect } from '@/i18n/navigation';

type BuildersPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Public builders list now lives on Exhibitors (first tab).
 */
export default async function BuildersPage({ params }: BuildersPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect({ href: '/partners?type=builder', locale });
}
