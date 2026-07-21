import { headers } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { BuyerCheckInStatus } from '@/features/buyer/components/buyer-checkin-status';
import { isBuyerAccount } from '@/features/buyer/utils/is-buyer-account';
import { getMeOrNull } from '@/features/auth/api/auth-api';
import { redirect } from '@/i18n/navigation';

type ProfileCheckInPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ProfileCheckInPage({ params }: ProfileCheckInPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') ?? undefined;
  const user = await getMeOrNull(cookieHeader);

  if (!user) {
    redirect({
      href: '/auth/login?returnUrl=%2Fsettings%2Fcheckin',
      locale,
    });
    return null;
  }

  if (!isBuyerAccount(user)) {
    redirect({ href: '/settings', locale });
    return null;
  }

  const t = await getTranslations('Profile.checkin');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-ink">{t('title')}</h2>
        <p className="text-sm text-ink-secondary">{t('subtitle')}</p>
      </div>
      <BuyerCheckInStatus />
    </div>
  );
}
