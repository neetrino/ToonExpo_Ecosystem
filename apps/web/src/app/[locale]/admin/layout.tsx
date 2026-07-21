import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';

import { AdminNav } from '@/features/admin/components/admin-nav';
import { getMeOrNull } from '@/features/auth/api/auth-api';
import { redirect } from '@/i18n/navigation';
import { PortalShell } from '@/shared/ui/portal-shell';

type AdminLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Server-gated platform admin shell. Non-admins get a generic 404.
 */
export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') ?? undefined;
  const user = await getMeOrNull(cookieHeader);

  if (!user) {
    redirect({ href: '/auth/login', locale });
    return null;
  }

  if (user.accountType !== 'platform_admin') {
    notFound();
  }

  const t = await getTranslations('Admin');

  return (
    <PortalShell
      brandHref="/admin"
      badge={t('badge')}
      userEmail={user.email}
      profileLabel={t('profileLink')}
      navLabel={t('nav.label')}
      sidebar={<AdminNav />}
    >
      {children}
    </PortalShell>
  );
}
