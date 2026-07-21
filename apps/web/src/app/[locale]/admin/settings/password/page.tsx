import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ChangePasswordForm } from '@/features/auth/components/change-password-form';
import { Card } from '@/shared/ui/card';

type AdminSettingsPasswordRouteProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Platform admin self-service password change inside the admin shell.
 */
export default async function AdminSettingsPasswordRoute({
  params,
}: AdminSettingsPasswordRouteProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Profile.changePassword');

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-ink">{t('title')}</h2>
        <p className="text-sm text-ink-secondary">{t('subtitle')}</p>
      </div>

      <Card>
        <ChangePasswordForm />
      </Card>
    </div>
  );
}
