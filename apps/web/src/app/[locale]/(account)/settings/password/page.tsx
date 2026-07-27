import { setRequestLocale } from 'next-intl/server';

import { redirect } from '@/i18n/navigation';

type SettingsPasswordRedirectPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Legacy password route — redirects to the unified Settings page.
 */
export default async function SettingsPasswordRedirectPage({
  params,
}: SettingsPasswordRedirectPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect({ href: '/settings', locale });
  return null;
}
