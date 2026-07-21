import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { LoginForm } from '@/features/auth/components/login-form';
import { Card } from '@/shared/ui/card';
import { SiteHeader } from '@/shared/ui/site-header';

type LoginPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ returnUrl?: string }>;
};

export const generateMetadata = async ({ params }: LoginPageProps): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Auth' });

  return {
    title: t('login.title'),
    description: t('login.subtitle'),
  };
};

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { locale } = await params;
  const { returnUrl } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('Auth');

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-12 sm:py-16">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-page-title text-ink">{t('login.title')}</h1>
          <p className="text-sm text-ink-secondary">{t('login.subtitle')}</p>
        </div>
        <Card variant="elevated" padding="lg">
          <LoginForm returnUrl={returnUrl} />
        </Card>
      </main>
    </div>
  );
}
