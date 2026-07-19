import { getTranslations, setRequestLocale } from 'next-intl/server';

import { SetPasswordPageContent } from '@/features/auth/components/set-password-page-content';
import { Card } from '@/shared/ui/card';
import { SiteHeader } from '@/shared/ui/site-header';

type SetPasswordPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SetPasswordPage({ params }: SetPasswordPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Auth');

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-12">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {t('setPassword.title')}
          </h1>
          <p className="text-sm text-ink-secondary">{t('setPassword.subtitle')}</p>
        </div>
        <Card>
          <SetPasswordPageContent />
        </Card>
      </main>
    </div>
  );
}
