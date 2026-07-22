import { headers } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AccountPageEnter } from '@/features/buyer/components/account/account-page-enter';
import { AccountPageHeader } from '@/features/buyer/components/account/account-page-header';
import { AccountShell } from '@/features/buyer/components/account/account-shell';
import { BuyerQrPageContent } from '@/features/buyer/components/buyer-qr-page-content';
import { isBuyerAccount } from '@/features/buyer/utils/is-buyer-account';
import { getMeOrNull } from '@/features/auth/api/auth-api';
import { redirect } from '@/i18n/navigation';

type MyQrPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Buyer My QR page at `/qr` (public token resolve stays at `/qr/[token]`).
 */
export default async function MyQrPage({ params }: MyQrPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') ?? undefined;
  const user = await getMeOrNull(cookieHeader);

  if (!user) {
    redirect({ href: '/auth/login?returnUrl=%2Fqr', locale });
    return null;
  }

  if (!isBuyerAccount(user)) {
    redirect({ href: '/dashboard', locale });
    return null;
  }

  const t = await getTranslations('Profile.qr');

  return (
    <AccountShell locale={locale}>
      <AccountPageEnter>
        <AccountPageHeader title={t('title')} subtitle={t('subtitle')} />
        <BuyerQrPageContent buyerName={user.name} />
      </AccountPageEnter>
    </AccountShell>
  );
}
