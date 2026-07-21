import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';

import { getCompanyProfile } from '@/features/builder/api/company-profile-api';
import { getPortalPartner } from '@/features/partner/api/portal-partner-api';
import { PartnerNav } from '@/features/partner/components/partner-nav';
import { getMeOrNull } from '@/features/auth/api/auth-api';
import { isPartnerCompatibleCompany } from '@/features/partners/utils/is-partner-compatible-company';
import { redirect } from '@/i18n/navigation';
import { isApiErrorStatus } from '@/shared/api/errors';
import { PortalShell } from '@/shared/ui/portal-shell';

type PartnerLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Server-gated partner portal shell for partner/bank/service company members.
 */
export default async function PartnerLayout({ children, params }: PartnerLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') ?? undefined;
  const user = await getMeOrNull(cookieHeader);

  if (!user) {
    redirect({ href: '/auth/login?returnUrl=%2Fpartner', locale });
    return null;
  }

  if (user.accountType !== 'company_member') {
    notFound();
  }

  const company = await loadCompanyProfile(cookieHeader);
  if (!company || !isPartnerCompatibleCompany(company.type)) {
    notFound();
  }

  const partner = await loadPartnerProfile(cookieHeader);
  if (!partner) {
    notFound();
  }

  const t = await getTranslations('Partner');

  return (
    <PortalShell
      brandHref="/partner"
      badge={t('badge')}
      userEmail={user.email}
      profileLabel={t('profileLink')}
      navLabel={t('nav.label')}
      sidebar={
        <PartnerNav
          companyName={company.name}
          partnerName={partner.name}
          partnerType={partner.type}
        />
      }
    >
      {children}
    </PortalShell>
  );
}

const loadCompanyProfile = async (cookieHeader: string | undefined) => {
  try {
    return await getCompanyProfile({ cookieHeader });
  } catch {
    return null;
  }
};

const loadPartnerProfile = async (cookieHeader: string | undefined) => {
  try {
    return await getPortalPartner({ cookieHeader });
  } catch (error) {
    if (isApiErrorStatus(error, 404)) {
      return null;
    }
    return null;
  }
};
