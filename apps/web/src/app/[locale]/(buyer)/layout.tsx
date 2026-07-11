import type { ReactNode } from 'react';

import { requireAreaAccess } from '@/lib/auth/guard';

type BuyerLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function BuyerLayout({ children, params }: BuyerLayoutProps) {
  const { locale } = await params;
  await requireAreaAccess('buyer', locale);
  return children;
}
