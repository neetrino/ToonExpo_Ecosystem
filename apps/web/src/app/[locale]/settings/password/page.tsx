import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ChangePasswordForm } from '@/features/auth/components/change-password-form';
import { Card } from '@/shared/ui/card';

type ChangePasswordPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Profile section for self-service password change (all account types).
 */
export default async function ChangePasswordPage({ params }: ChangePasswordPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Profile.changePassword');

  return (
    <div className="flex flex-col gap-6">
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
