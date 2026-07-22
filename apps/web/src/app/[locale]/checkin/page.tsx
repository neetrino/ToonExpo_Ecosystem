import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AccountPageEnter } from '@/features/buyer/components/account/account-page-enter';
import { AccountPageHeader } from '@/features/buyer/components/account/account-page-header';
import { BuyerCheckInStatus } from '@/features/buyer/components/buyer-checkin-status';
import { isBuyerAccount } from '@/features/buyer/utils/is-buyer-account';
import { getMeOrNull } from '@/features/auth/api/auth-api';
import { CheckinPage } from '@/features/exhibition/components/checkin/checkin-page';

type CheckinRoutePageProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async ({ params }: CheckinRoutePageProps): Promise<Metadata> => {
  const { locale } = await params;
  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') ?? undefined;
  const user = await getMeOrNull(cookieHeader);

  if (isBuyerAccount(user)) {
    const t = await getTranslations({ locale, namespace: 'Profile.checkin' });
    return {
      title: t('title'),
      description: t('subtitle'),
    };
  }

  const t = await getTranslations({ locale, namespace: 'Checkin' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
};

/**
 * Buyer check-in status or entrance-staff scanner, depending on account type.
 */
export default async function CheckinRoutePage({ params }: CheckinRoutePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') ?? undefined;
  const user = await getMeOrNull(cookieHeader);

  if (isBuyerAccount(user)) {
    const t = await getTranslations('Profile.checkin');
    return (
      <AccountPageEnter>
        <AccountPageHeader title={t('title')} subtitle={t('subtitle')} />
        <BuyerCheckInStatus />
      </AccountPageEnter>
    );
  }

  return <CheckinPage />;
}
