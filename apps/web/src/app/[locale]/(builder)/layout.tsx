import type { ReactNode } from 'react';

import { requireAreaAccess } from '@/lib/auth/guard';

type BuilderLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function BuilderLayout({ children, params }: BuilderLayoutProps) {
  const { locale } = await params;
  await requireAreaAccess('builder', locale);
  return children;
}
