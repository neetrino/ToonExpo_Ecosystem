import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import { getCompanyProfileCached as getCompanyProfile } from '@/features/builder/api/get-company-profile-cached';
import { getPortalPartner } from '@/features/partner/api/portal-partner-api';
import { PartnerNav } from '@/features/partner/components/partner-nav';
import { getMeSessionCached } from '@/features/auth/api/get-me-or-null-cached';
import { isPartnerCompatibleCompany } from '@/features/partners/utils/is-partner-compatible-company';
import { redirect } from '@/i18n/navigation';
import { isApiErrorStatus } from '@/shared/api/errors';
import { PanelIntlProvider, resolvePanelLocale } from '@/shared/i18n/panel-intl-provider';
import { ApiUnavailablePanel } from '@/shared/ui/api-unavailable-panel';
import { PortalShell } from '@/shared/ui/portal-shell';

type PartnerLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Server-gated partner portal shell for partner/bank/service company members.
 */
export default async function PartnerLayout({ children, params }: PartnerLayoutProps) {
  const { locale: urlLocale } = await params;
  const panelLocale = await resolvePanelLocale(urlLocale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') ?? undefined;
  const session = await getMeSessionCached(cookieHeader);
  if (session.status === 'unavailable') {
    return <ApiUnavailablePanel />;
  }
  const { user } = session;

  if (!user) {
    redirect({ href: '/auth/login?returnUrl=%2Fpartner', locale: urlLocale });
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

  const t = await getTranslations({ locale: panelLocale, namespace: 'Partner' });

  return (
    <PanelIntlProvider urlLocale={urlLocale}>
      <PortalShell
        brandHref="/partner"
        badge={t('badge')}
        userEmail={user.email}
        profileLabel={t('profileLink')}
        profileHref="/partner/settings"
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
    </PanelIntlProvider>
  );
}

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
