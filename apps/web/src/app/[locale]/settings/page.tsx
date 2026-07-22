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
 * Account settings: profile + password inside one shared white panel.
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

      <Reveal>
        <AccountContentPanel className="max-w-4xl gap-8">
          <AccountProfileBanner user={user} />

          <div className="border-t border-border/70 pt-8">
            <AccountSectionHeading
              icon={KeyRound}
              title={tPassword('title')}
              subtitle={tPassword('subtitle')}
              headingId="account-password-heading"
            />
            <div className="mt-5 max-w-md">
              <ChangePasswordForm />
            </div>
          </div>
        </AccountContentPanel>
      </Reveal>
    </AccountPageEnter>
  );
}
