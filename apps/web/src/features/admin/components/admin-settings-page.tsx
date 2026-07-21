import type { UserResponse } from '@toonexpo/contracts';
import { getTranslations } from 'next-intl/server';

import { LogoutButton } from '@/features/auth/components/logout-button';
import { Card } from '@/shared/ui/card';

type AdminSettingsPageProps = {
  user: UserResponse;
};

type SettingsRowProps = {
  label: string;
  value: string;
};

const SettingsRow = ({ label, value }: SettingsRowProps) => (
  <div className="flex flex-col gap-1 border-b border-border pb-3 last:border-b-0 last:pb-0">
    <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</dt>
    <dd className="text-sm font-medium text-ink">{value}</dd>
  </div>
);

/**
 * Platform admin account overview inside the admin portal shell.
 */
export const AdminSettingsPage = async ({ user }: AdminSettingsPageProps) => {
  const t = await getTranslations('Admin.settings');
  const tProfile = await getTranslations('Profile');

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-ink">{t('profileTitle')}</h2>
        <p className="text-sm text-ink-secondary">{t('profileSubtitle')}</p>
      </div>

      <Card className="flex flex-col gap-4">
        <dl className="flex flex-col gap-4">
          <SettingsRow label={tProfile('fields.name')} value={user.name} />
          <SettingsRow label={tProfile('fields.email')} value={user.email} />
          <SettingsRow
            label={tProfile('fields.phone')}
            value={user.phone ?? tProfile('fields.phoneEmpty')}
          />
          <SettingsRow label={tProfile('fields.accountType')} value={user.accountType} />
        </dl>
        <div className="pt-2">
          <LogoutButton variant="secondary" size="md" className="w-full sm:w-auto" />
        </div>
      </Card>
    </div>
  );
};
