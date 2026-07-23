import { setRequestLocale } from 'next-intl/server';

import { redirect } from '@/i18n/navigation';

type AdminNewCompanyPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Legacy `/admin/companies/new` → list with create sheet open.
 */
export default async function AdminNewCompanyPage({ params }: AdminNewCompanyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect({ href: '/admin/companies?create=1', locale });
}
