import { getTranslations, setRequestLocale } from 'next-intl/server';

import { auth } from '@/auth';
import { LoginForm } from '@/components/auth/login-form';
import { redirect } from '@/i18n/navigation';
import { safeAuthCallbackPath } from '@/lib/auth/callback-url';
import { ACCOUNT_PATH } from '@/lib/auth/constants';

import { loginAction } from '../actions';

type LoginPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ invited?: string; callbackUrl?: string }>;
};

function localeRelativePath(callbackUrl: string, locale: string): string {
  const prefix = `/${locale}`;
  if (callbackUrl === prefix) {
    return '/';
  }
  if (callbackUrl.startsWith(`${prefix}/`)) {
    return callbackUrl.slice(prefix.length);
  }
  return ACCOUNT_PATH;
}

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { locale } = await params;
  const { invited, callbackUrl: rawCallback } = await searchParams;
  setRequestLocale(locale);

  const callbackUrl = safeAuthCallbackPath(rawCallback, locale);

  const session = await auth();
  if (session?.user) {
    redirect({
      href: callbackUrl ? localeRelativePath(callbackUrl, locale) : ACCOUNT_PATH,
      locale,
    });
  }

  const t = await getTranslations('auth.login');
  const registerHref = callbackUrl
    ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : '/register';

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 px-6 py-16">
      <div className="rounded-[var(--te-radius)] border border-[var(--te-border)] bg-[var(--te-card)] p-6 shadow-[var(--te-shadow-soft)]">
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-[var(--te-fg)]">{t('title')}</h1>
          <p className="text-sm text-[var(--te-muted)]">{t('subtitle')}</p>
        </div>
        {invited === '1' ? (
          <p role="status" className="mb-4 text-sm text-[var(--te-accent)]">
            {t('invitedSuccess')}
          </p>
        ) : null}
        <LoginForm action={loginAction.bind(null, locale, callbackUrl)} registerHref={registerHref} />
      </div>
    </section>
  );
}
