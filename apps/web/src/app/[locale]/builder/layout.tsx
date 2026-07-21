import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';

import { getCompanyProfile } from '@/features/builder/api/company-profile-api';
import { BuilderNav } from '@/features/builder/components/builder-nav';
import { getMeOrNull } from '@/features/auth/api/auth-api';
import { redirect } from '@/i18n/navigation';
import { PortalShell } from '@/shared/ui/portal-shell';

type BuilderLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Server-gated builder portal shell. Non-members get a generic 404.
 */
export default async function BuilderLayout({ children, params }: BuilderLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') ?? undefined;
  const user = await getMeOrNull(cookieHeader);

  if (!user) {
    redirect({ href: '/auth/login', locale });
    return null;
  }

  if (user.accountType !== 'company_member') {
    notFound();
  }

  const companyName = await loadCompanyName(cookieHeader);
  const t = await getTranslations('Builder');

  return (
    <PortalShell
      brandHref="/builder"
      badge={t('badge')}
      userEmail={user.email}
      profileLabel={t('profileLink')}
      navLabel={t('nav.label')}
      sidebar={<BuilderNav companyName={companyName} />}
    >
      {children}
    </PortalShell>
  );
}

const loadCompanyName = async (cookieHeader: string | undefined): Promise<string | null> => {
  try {
    const profile = await getCompanyProfile({ cookieHeader });
    return profile.name;
  } catch {
    return null;
  }
};
