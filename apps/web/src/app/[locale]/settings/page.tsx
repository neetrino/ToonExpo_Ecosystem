import { headers } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AccountContentPanel } from '@/features/buyer/components/account/account-content-panel';
import { AccountOverviewStats } from '@/features/buyer/components/account/account-overview-stats';
import { AccountPageEnter } from '@/features/buyer/components/account/account-page-enter';
import { AccountPageHeader } from '@/features/buyer/components/account/account-page-header';
import { AccountProfileField } from '@/features/buyer/components/account/account-profile-field';
import { getMeOrNull } from '@/features/auth/api/auth-api';
import { getCompanyProfile } from '@/features/builder/api/company-profile-api';
import { isBuyerAccount } from '@/features/buyer/utils/is-buyer-account';
import { getPortalPartner } from '@/features/partner/api/portal-partner-api';
import { isPartnerCompatibleCompany } from '@/features/partners/utils/is-partner-compatible-company';
import { redirect } from '@/i18n/navigation';
import { isApiErrorStatus } from '@/shared/api/errors';
import { Reveal } from '@/shared/ui/motion/reveal';

type ProfilePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
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
        title={t('overview.welcome', { name: user.name })}
        subtitle={t('cabinetSubtitle')}
      />

      {showBuyerOverview ? (
        <Reveal fadeOnly>
          <AccountOverviewStats />
        </Reveal>
      ) : null}

      <Reveal delayMs={60}>
        <AccountContentPanel>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-ink">{t('title')}</h2>
            <p className="text-sm text-ink-secondary">{t('subtitle')}</p>
          </div>

          <dl className="flex flex-col gap-4">
            <AccountProfileField label={t('fields.name')} value={user.name} />
            <AccountProfileField label={t('fields.email')} value={user.email} />
            <AccountProfileField
              label={t('fields.phone')}
              value={user.phone ?? t('fields.phoneEmpty')}
            />
            <AccountProfileField
              label={t('fields.accountType')}
              value={t(`accountTypes.${user.accountType}`)}
            />
          </dl>
        </AccountContentPanel>
      </Reveal>
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
