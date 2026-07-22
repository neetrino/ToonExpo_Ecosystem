import type { ReactNode } from 'react';

import { AccountShell } from '@/features/buyer/components/account/account-shell';

type SettingsLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Account settings section shell (shared with /dashboard).
 */
export default async function SettingsLayout({ children, params }: SettingsLayoutProps) {
  const { locale } = await params;
  return <AccountShell locale={locale}>{children}</AccountShell>;
}
