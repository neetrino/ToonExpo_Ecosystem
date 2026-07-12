import type { ReactNode } from 'react';

import { requireAreaAccess } from '@/lib/auth/guard';

/** Account/deals/QR are session-bound — never serve a prerendered empty shell. */
export const dynamic = 'force-dynamic';

type BuyerLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function BuyerLayout({ children, params }: BuyerLayoutProps) {
  const { locale } = await params;
  await requireAreaAccess('buyer', locale);
  return children;
}
