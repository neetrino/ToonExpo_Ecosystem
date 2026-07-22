import { headers } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AccountOverviewStats } from '@/features/buyer/components/account/account-overview-stats';
import { AccountPageEnter } from '@/features/buyer/components/account/account-page-enter';
import { AccountPageHeader } from '@/features/buyer/components/account/account-page-header';
import { getMeOrNull } from '@/features/auth/api/auth-api';
import { getCompanyProfile } from '@/features/builder/api/company-profile-api';
import { isBuyerAccount } from '@/features/buyer/utils/is-buyer-account';
import { getPortalPartner } from '@/features/partner/api/portal-partner-api';
import { isPartnerCompatibleCompany } from '@/features/partners/utils/is-partner-compatible-company';
import { Link, redirect } from '@/i18n/navigation';
import { isApiErrorStatus } from '@/shared/api/errors';
import { Card } from '@/shared/ui/card';
import { Reveal } from '@/shared/ui/motion/reveal';

type DashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') ?? undefined;
  const user = await getMeOrNull(cookieHeader);

  if (!user) {
    redirect({ href: '/auth/login', locale });
    return null;
  }

  if (user.accountType === 'company_member') {
    const company = await loadCompanyProfile(cookieHeader);
    if (company && isPartnerCompatibleCompany(company.type)) {
      const partner = await loadPartnerProfile(cookieHeader);
      if (partner) {
        redirect({ href: '/partner', locale });
        return null;
      }
    }
  }

  const t = await getTranslations('Profile');
  const showBuyerOverview = isBuyerAccount(user);

  return (
    <AccountPageEnter>
      <AccountPageHeader
        title={t('dashboard.welcome', { name: user.name })}
        subtitle={t('cabinetSubtitle')}
      />

      {showBuyerOverview ? (
        <Reveal fadeOnly>
          <AccountOverviewStats />
        </Reveal>
      ) : (
        <Reveal>
          <Card variant="elevated" className="max-w-xl">
            <p className="text-sm text-ink-secondary">{t('dashboard.settingsHint')}</p>
            <Link
              href="/settings"
              className="mt-3 inline-flex text-sm font-semibold text-brand hover:underline"
            >
              {t('nav.password')}
            </Link>
          </Card>
        </Reveal>
      )}
    </AccountPageEnter>
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
