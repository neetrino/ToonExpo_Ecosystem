import { getLocale, setRequestLocale } from 'next-intl/server';

import { redirect } from '@/i18n/navigation';

type AdminNewEventPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Legacy `/admin/events/new` → list with create sheet open.
 */
export default async function AdminNewEventRoutePage({ params }: AdminNewEventPageProps) {
  const { locale: urlLocale } = await params;
  const locale = await getLocale();
  setRequestLocale(locale);
  redirect({ href: '/admin/events?create=1', locale: urlLocale });
}
