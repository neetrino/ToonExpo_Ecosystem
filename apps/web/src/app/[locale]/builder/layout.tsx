import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';

import { getMeOrNullCached as getMeOrNull } from '@/features/auth/api/get-me-or-null-cached';
import { getCompanyProfileCached as getCompanyProfile } from '@/features/builder/api/get-company-profile-cached';
import { BuilderMobileStack } from '@/features/builder/components/builder-mobile-stack';
import { BuilderNav } from '@/features/builder/components/builder-nav';
import { redirect } from '@/i18n/navigation';
import { isApiErrorStatus } from '@/shared/api/errors';
import { PortalShell } from '@/shared/ui/portal-shell';

type BuilderLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Server-gated builder portal shell. Non-builder members get a generic 404.
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

  const company = await loadCompanyProfile(cookieHeader);
  if (!company || company.type !== 'builder') {
    notFound();
  }

  const t = await getTranslations('Builder');

  return (
    <PortalShell
      brandHref="/builder"
      badge={t('badge')}
      userEmail={user.email}
      profileLabel={t('profileLink')}
      profileHref="/builder/settings"
      navLabel={t('nav.label')}
      variant="rail"
      showRailHeaderMask={false}
      mobileDrawerControlledByNavbar
      className="bg-canvas"
      sidebar={<BuilderNav companyName={company.name} />}
    >
      <BuilderMobileStack name={user.name} email={user.email} companyName={company.name}>
        {children}
      </BuilderMobileStack>
    </PortalShell>
  );
}

/**
 * Auth denials → null (layout 404). Transient API failures (429/5xx) rethrow.
 */
const loadCompanyProfile = async (cookieHeader: string | undefined) => {
  try {
    return await getCompanyProfile(cookieHeader);
  } catch (error) {
    if (isApiErrorStatus(error, 401) || isApiErrorStatus(error, 403)) {
      return null;
    }
    throw error;
  }
};
