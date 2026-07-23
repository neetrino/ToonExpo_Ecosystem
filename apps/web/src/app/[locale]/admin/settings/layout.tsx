import type { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';

type AdminSettingsLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Admin settings section — page chrome lives in the settings page itself.
 */
export default async function AdminSettingsLayout({ children, params }: AdminSettingsLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return children;
}
