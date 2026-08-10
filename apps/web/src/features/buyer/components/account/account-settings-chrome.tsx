'use client';

import type { UserResponse } from '@toonexpo/contracts';
import { KeyRound } from 'lucide-react';

import { ChangePasswordForm } from '@/features/auth/components/change-password-form';
import { AccountContentPanel } from '@/features/buyer/components/account/account-content-panel';
import {
  AccountContentReveal,
  AccountPageEnter,
} from '@/features/buyer/components/account/account-page-enter';
import { AccountPageHeader } from '@/features/buyer/components/account/account-page-header';
import { AccountProfileBanner } from '@/features/buyer/components/account/account-profile-banner';
import { AccountSectionHeading } from '@/features/buyer/components/account/account-section-heading';

type AccountSettingsChromeProps = {
  title: string;
  subtitle: string;
  passwordTitle: string;
  passwordSubtitle: string;
  passwordHeadingId: string;
  user: UserResponse;
  mobilePush?: boolean | undefined;
};

/**
 * Client settings chrome — owns Lucide icons so RSC never serializes them.
 */
export const AccountSettingsChrome = ({
  title,
  subtitle,
  passwordTitle,
  passwordSubtitle,
  passwordHeadingId,
  user,
  mobilePush = false,
}: AccountSettingsChromeProps) => {
  return (
    <AccountPageEnter mobilePush={mobilePush}>
      <AccountPageHeader title={title} subtitle={subtitle} iconName="settings" />

      <AccountContentReveal>
        <AccountContentPanel className="max-w-4xl gap-8">
          <AccountProfileBanner user={user} />

          <div className="border-t border-border/70 pt-8">
            <AccountSectionHeading
              icon={KeyRound}
              title={passwordTitle}
              subtitle={passwordSubtitle}
              headingId={passwordHeadingId}
            />
            <div className="mt-5 max-w-md">
              <ChangePasswordForm />
            </div>
          </div>
        </AccountContentPanel>
      </AccountContentReveal>
    </AccountPageEnter>
  );
};
