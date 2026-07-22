import { KeyRound } from 'lucide-react';
import { headers } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getMeOrNull } from '@/features/auth/api/auth-api';
import { ChangePasswordForm } from '@/features/auth/components/change-password-form';
import { AccountContentPanel } from '@/features/buyer/components/account/account-content-panel';
import { AccountPageEnter } from '@/features/buyer/components/account/account-page-enter';
import { AccountPageHeader } from '@/features/buyer/components/account/account-page-header';
import { AccountProfileBanner } from '@/features/buyer/components/account/account-profile-banner';
import { AccountSectionHeading } from '@/features/buyer/components/account/account-section-heading';
import { redirect } from '@/i18n/navigation';
import { Reveal } from '@/shared/ui/motion/reveal';

type AccountSettingsPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Account settings: unified profile banner + password change.
 */
export default async function AccountSettingsPage({ params }: AccountSettingsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') ?? undefined;
  const user = await getMeOrNull(cookieHeader);

  if (!user) {
    redirect({ href: '/auth/login?returnUrl=%2Fsettings', locale });
    return null;
  }

  const t = await getTranslations('Profile');
  const tPassword = await getTranslations('Profile.changePassword');

  return (
    <AccountPageEnter>
      <AccountPageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <div className="grid gap-6 xl:grid-cols-2 xl:items-start">
        <Reveal>
          <AccountProfileBanner user={user} />
        </Reveal>

        <Reveal delayMs={60}>
          <AccountContentPanel>
            <AccountSectionHeading
              icon={KeyRound}
              title={tPassword('title')}
              subtitle={tPassword('subtitle')}
              headingId="account-password-heading"
            />
            <ChangePasswordForm />
          </AccountContentPanel>
        </Reveal>
      </div>
    </AccountPageEnter>
  );
}
