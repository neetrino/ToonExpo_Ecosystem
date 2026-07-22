import { headers } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AccountContentPanel } from '@/features/buyer/components/account/account-content-panel';
import { AccountPageEnter } from '@/features/buyer/components/account/account-page-enter';
import { AccountPageHeader } from '@/features/buyer/components/account/account-page-header';
import { AccountProfileField } from '@/features/buyer/components/account/account-profile-field';
import { ChangePasswordForm } from '@/features/auth/components/change-password-form';
import { getMeOrNull } from '@/features/auth/api/auth-api';
import { redirect } from '@/i18n/navigation';
import { Reveal } from '@/shared/ui/motion/reveal';

type AccountSettingsPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Account settings: personal information (read-only) + password change.
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
        <AccountContentPanel className="max-w-xl">
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

      <Reveal delayMs={60}>
        <AccountContentPanel className="max-w-xl">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-ink">{tPassword('title')}</h2>
            <p className="text-sm text-ink-secondary">{tPassword('subtitle')}</p>
          </div>
          <ChangePasswordForm />
        </AccountContentPanel>
      </Reveal>
    </AccountPageEnter>
  );
}
