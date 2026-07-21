import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AuthPageShell } from '@/features/auth/components/auth-page-shell';
import { LoginForm } from '@/features/auth/components/login-form';

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
    <AuthPageShell title={t('login.title')} subtitle={t('login.subtitle')} variant="login">
      <LoginForm returnUrl={returnUrl} />
    </AuthPageShell>
  );
}
