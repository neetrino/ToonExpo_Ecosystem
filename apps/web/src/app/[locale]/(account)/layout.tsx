import type { ReactNode } from 'react';

import { AccountShell } from '@/features/buyer/components/account/account-shell';

type AccountGroupLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Shared buyer account chrome — keeps AccountShell (and mobile hub stack) mounted
 * across dashboard / favorites / requests / settings / QR / check-in so sub-pages
 * can slide over and entrance motion stays consistent.
 */
export default async function AccountGroupLayout({ children, params }: AccountGroupLayoutProps) {
  const { locale } = await params;
  return <AccountShell locale={locale}>{children}</AccountShell>;
}
