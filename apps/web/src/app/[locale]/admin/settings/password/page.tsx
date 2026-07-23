import { setRequestLocale } from 'next-intl/server';

import { redirect } from '@/i18n/navigation';

type AdminSettingsPasswordRedirectPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Legacy password route — redirects to the unified admin Settings page.
 */
export default async function AdminSettingsPasswordRedirectPage({
  params,
}: AdminSettingsPasswordRedirectPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect({ href: '/admin/settings', locale });
  return null;
}
