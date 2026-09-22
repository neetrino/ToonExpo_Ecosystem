import type { UserResponse } from '@toonexpo/contracts';

import { PanelLocaleSettingsSection } from '@/features/admin/components/panel-locale-settings-section';
import { AccountSettingsView } from '@/features/buyer/components/account/account-settings-view';

type AdminSettingsPageProps = {
  user: UserResponse;
};

/**
 * Platform admin account settings — same cabinet chrome as buyer settings,
 * plus an independent panel UI language control.
 */
export const AdminSettingsPage = async ({ user }: AdminSettingsPageProps) => {
  return (
    <AccountSettingsView
      user={user}
      titleNamespace="Admin.settings"
      passwordHeadingId="admin-password-heading"
      extraSections={<PanelLocaleSettingsSection />}
    />
  );
};
