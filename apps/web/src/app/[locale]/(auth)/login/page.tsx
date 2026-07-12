import { getTranslations, setRequestLocale } from 'next-intl/server';

import { auth } from '@/auth';
import { LoginForm } from '@/components/auth/login-form';
import { redirect } from '@/i18n/navigation';
import { ACCOUNT_PATH } from '@/lib/auth/constants';

import { loginAction } from '../actions';

type LoginPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ invited?: string }>;
};

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { locale } = await params;
  const { invited } = await searchParams;
  setRequestLocale(locale);

  const session = await auth();
  if (session?.user) {
    redirect({ href: ACCOUNT_PATH, locale });
  }

  const t = await getTranslations('auth.login');

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 px-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-sm text-[var(--te-muted)]">{t('subtitle')}</p>
      </div>
      {invited === '1' ? (
        <p role="status" className="text-sm text-green-400">
          {t('invitedSuccess')}
        </p>
      ) : null}
      <LoginForm action={loginAction.bind(null, locale)} />
    </section>
  );
}
