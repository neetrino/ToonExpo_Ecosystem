import type { ReactNode } from 'react';

import { requireAreaAccess } from '@/lib/auth/guard';

type PartnerAreaLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function PartnerAreaLayout({ children, params }: PartnerAreaLayoutProps) {
  const { locale } = await params;
  await requireAreaAccess('partner', locale);
  return children;
}
