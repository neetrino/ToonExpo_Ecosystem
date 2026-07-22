import { headers } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AccountPageEnter } from '@/features/buyer/components/account/account-page-enter';
import { AccountPageHeader } from '@/features/buyer/components/account/account-page-header';
import { BuyerFavoritesList } from '@/features/buyer/components/buyer-favorites-list';
import { isBuyerAccount } from '@/features/buyer/utils/is-buyer-account';
import { getMeOrNull } from '@/features/auth/api/auth-api';
import { redirect } from '@/i18n/navigation';

type ProfileFavoritesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ProfileFavoritesPage({ params }: ProfileFavoritesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') ?? undefined;
  const user = await getMeOrNull(cookieHeader);

  if (!user) {
    redirect({
      href: '/auth/login?returnUrl=%2Fsettings%2Ffavorites',
      locale,
    });
    return null;
  }

  if (!isBuyerAccount(user)) {
    redirect({ href: '/settings', locale });
    return null;
  }

  const t = await getTranslations('Profile.favorites');

  return (
    <AccountPageEnter>
      <AccountPageHeader title={t('title')} subtitle={t('subtitle')} />
      <BuyerFavoritesList />
    </AccountPageEnter>
  );
}
