import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getMeOrNullCached as getMeOrNull } from '@/features/auth/api/get-me-or-null-cached';
import {
  AccountContentReveal,
  AccountPageEnter,
} from '@/features/buyer/components/account/account-page-enter';
import { AccountPageHeader } from '@/features/buyer/components/account/account-page-header';
import { BuyerCheckInStatus } from '@/features/buyer/components/buyer-checkin-status';
import { isBuyerAccount } from '@/features/buyer/utils/is-buyer-account';
import { redirect } from '@/i18n/navigation';

type CheckinPageProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async ({ params }: CheckinPageProps): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Profile.checkin' });
  return {
    title: t('title'),
    description: t('subtitle'),
  };
};

/**
 * Buyer check-in status — lives under `(account)` so AccountShell stays mounted
 * when navigating to/from other account pages (smooth Reveal + mobile sheet).
 */
export default async function AccountCheckinPage({ params }: CheckinPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') ?? undefined;
  const user = await getMeOrNull(cookieHeader);

  if (!user) {
    redirect({ href: '/auth/login?returnUrl=%2Fcheckin', locale });
    return null;
  }

  if (user.accountType === 'platform_admin') {
    redirect({ href: '/admin/checkin', locale });
    return null;
  }

  if (user.accountType === 'entrance_staff') {
    redirect({ href: '/staff/checkin', locale });
    return null;
  }

  if (!isBuyerAccount(user)) {
    redirect({ href: '/dashboard', locale });
    return null;
  }

  const t = await getTranslations('Profile.checkin');

  return (
    <AccountPageEnter mobilePush>
      <AccountPageHeader title={t('title')} subtitle={t('subtitle')} iconName="checkin" />
      <AccountContentReveal>
        <BuyerCheckInStatus />
      </AccountContentReveal>
    </AccountPageEnter>
  );
}
