import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { RegisterForm } from '@/features/auth/components/register-form';
import { Card } from '@/shared/ui/card';
import { SiteHeader } from '@/shared/ui/site-header';

type RegisterPageProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async ({ params }: RegisterPageProps): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Auth' });

  return {
    title: t('register.title'),
    description: t('register.subtitle'),
  };
};

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Auth');

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-12">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('register.title')}</h1>
          <p className="text-sm text-ink-secondary">{t('register.subtitle')}</p>
        </div>
        <Card>
          <RegisterForm />
        </Card>
      </main>
    </div>
  );
}
