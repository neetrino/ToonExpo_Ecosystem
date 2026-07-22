import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AccountContentPanel } from '@/features/buyer/components/account/account-content-panel';
import { AccountPageEnter } from '@/features/buyer/components/account/account-page-enter';
import { AccountPageHeader } from '@/features/buyer/components/account/account-page-header';
import { ChangePasswordForm } from '@/features/auth/components/change-password-form';
import { Reveal } from '@/shared/ui/motion/reveal';

type ChangePasswordPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Account settings: self-service password change.
 */
export default async function ChangePasswordPage({ params }: ChangePasswordPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Profile.changePassword');

  return (
    <AccountPageEnter>
      <AccountPageHeader title={t('title')} subtitle={t('subtitle')} />
      <Reveal>
        <AccountContentPanel className="max-w-xl">
          <ChangePasswordForm />
        </AccountContentPanel>
      </Reveal>
    </AccountPageEnter>
  );
}
