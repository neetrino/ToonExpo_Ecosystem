import type { ReactNode } from 'react';

import { requireAreaAccess } from '@/lib/auth/guard';

type AdminLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params;
  await requireAreaAccess('admin', locale);
  return children;
}
