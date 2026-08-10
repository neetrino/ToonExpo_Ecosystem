import type { UserResponse } from '@toonexpo/contracts';
import { getTranslations } from 'next-intl/server';

import { AccountSettingsChrome } from '@/features/buyer/components/account/account-settings-chrome';

type AccountSettingsViewProps = {
  user: UserResponse;
  /** i18n namespace for page title/subtitle, e.g. `Profile.settings` or `Admin.settings`. */
  titleNamespace: 'Profile.settings' | 'Admin.settings' | 'Builder.settings' | 'Partner.settings';
  passwordHeadingId?: string | undefined;
  /** Buyer mobile hub → settings push transition + back control. */
  mobilePush?: boolean | undefined;
};

/**
 * Shared account settings chrome: profile banner + password in one elevated panel.
 */
export const AccountSettingsView = async ({
  user,
  titleNamespace,
  passwordHeadingId = 'account-password-heading',
  mobilePush = false,
}: AccountSettingsViewProps) => {
  const t = await getTranslations(titleNamespace);
  const tPassword = await getTranslations('Profile.changePassword');

  return (
    <AccountSettingsChrome
      title={t('title')}
      subtitle={t('subtitle')}
      passwordTitle={tPassword('title')}
      passwordSubtitle={tPassword('subtitle')}
      passwordHeadingId={passwordHeadingId}
      user={user}
      mobilePush={mobilePush}
    />
  );
};
