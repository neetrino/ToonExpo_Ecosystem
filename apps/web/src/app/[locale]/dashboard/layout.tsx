import type { ReactNode } from 'react';

import { AccountShell } from '@/features/buyer/components/account/account-shell';

type DashboardLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Account dashboard shell (shared with /settings/*).
 */
export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { locale } = await params;
  return <AccountShell locale={locale}>{children}</AccountShell>;
}
