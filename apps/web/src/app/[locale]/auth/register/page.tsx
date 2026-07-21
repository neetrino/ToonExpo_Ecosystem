import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { AuthPageShell } from '@/features/auth/components/auth-page-shell';
import { RegisterForm } from '@/features/auth/components/register-form';

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
    <AuthPageShell title={t('register.title')} subtitle={t('register.subtitle')} variant="register">
      <RegisterForm />
    </AuthPageShell>
  );
}
