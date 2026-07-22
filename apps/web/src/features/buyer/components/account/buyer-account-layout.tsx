import type { ReactNode } from 'react';

import { AccountShell } from '@/features/buyer/components/account/account-shell';

type BuyerAccountLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Shared account chrome for top-level buyer cabinet routes.
 */
export const BuyerAccountLayout = async ({ children, params }: BuyerAccountLayoutProps) => {
  const { locale } = await params;
  return <AccountShell locale={locale}>{children}</AccountShell>;
};
