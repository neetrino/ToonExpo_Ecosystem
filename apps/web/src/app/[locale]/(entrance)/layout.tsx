import type { ReactNode } from 'react';

import { requireAreaAccess } from '@/lib/auth/guard';

type EntranceLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function EntranceLayout({ children, params }: EntranceLayoutProps) {
  const { locale } = await params;
  await requireAreaAccess('entrance', locale);
  return children;
}
