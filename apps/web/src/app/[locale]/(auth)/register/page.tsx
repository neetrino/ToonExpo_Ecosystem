import { getTranslations, setRequestLocale } from 'next-intl/server';

import { auth } from '@/auth';
import { RegisterForm } from '@/components/auth/register-form';
import { redirect } from '@/i18n/navigation';
import { ACCOUNT_PATH } from '@/lib/auth/constants';

import { registerAction } from '../actions';

type RegisterPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (session?.user) {
    redirect({ href: ACCOUNT_PATH, locale });
  }

  const t = await getTranslations('auth.register');

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 px-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-sm text-[var(--te-muted)]">{t('subtitle')}</p>
      </div>
      <RegisterForm action={registerAction.bind(null, locale)} />
    </section>
  );
}
