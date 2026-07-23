import type { UserResponse } from '@toonexpo/contracts';
import { KeyRound } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { ChangePasswordForm } from '@/features/auth/components/change-password-form';
import { AccountContentPanel } from '@/features/buyer/components/account/account-content-panel';
import { AccountPageEnter } from '@/features/buyer/components/account/account-page-enter';
import { AccountPageHeader } from '@/features/buyer/components/account/account-page-header';
import { AccountProfileBanner } from '@/features/buyer/components/account/account-profile-banner';
import { AccountSectionHeading } from '@/features/buyer/components/account/account-section-heading';
import { Reveal } from '@/shared/ui/motion/reveal';

type AdminSettingsPageProps = {
  user: UserResponse;
};

/**
 * Platform admin account settings — same cabinet chrome as buyer settings.
 */
export const AdminSettingsPage = async ({ user }: AdminSettingsPageProps) => {
  const t = await getTranslations('Admin.settings');
  const tPassword = await getTranslations('Profile.changePassword');

  return (
    <AccountPageEnter>
      <AccountPageHeader title={t('title')} subtitle={t('subtitle')} />

      <Reveal>
        <AccountContentPanel className="max-w-4xl gap-8">
          <AccountProfileBanner user={user} />

          <div className="border-t border-border/70 pt-8">
            <AccountSectionHeading
              icon={KeyRound}
              title={tPassword('title')}
              subtitle={tPassword('subtitle')}
              headingId="admin-password-heading"
            />
            <div className="mt-5 max-w-md">
              <ChangePasswordForm />
            </div>
          </div>
        </AccountContentPanel>
      </Reveal>
    </AccountPageEnter>
  );
};
