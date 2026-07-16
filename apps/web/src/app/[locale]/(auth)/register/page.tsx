import { getTranslations, setRequestLocale } from 'next-intl/server';

import { auth } from '@/auth';
import { RegisterForm } from '@/components/auth/register-form';
import { redirect } from '@/i18n/navigation';
import { safeAuthCallbackPath } from '@/lib/auth/callback-url';
import { ACCOUNT_PATH } from '@/lib/auth/constants';

import { registerAction } from '../actions';

type RegisterPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl?: string }>;
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

export default async function RegisterPage({ params, searchParams }: RegisterPageProps) {
  const { locale } = await params;
  const { callbackUrl: rawCallback } = await searchParams;
  setRequestLocale(locale);

  const callbackUrl = safeAuthCallbackPath(rawCallback, locale);

  const session = await auth();
  if (session?.user) {
    redirect({
      href: callbackUrl ? localeRelativePath(callbackUrl, locale) : ACCOUNT_PATH,
      locale,
    });
  }

  const t = await getTranslations('auth.register');
  const loginHref = callbackUrl
    ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : '/login';

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 px-6 py-16">
      <div className="rounded-[var(--te-radius)] border border-[var(--te-border)] bg-[var(--te-card)] p-6 shadow-[var(--te-shadow-soft)]">
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-[var(--te-fg)]">{t('title')}</h1>
          <p className="text-sm text-[var(--te-muted)]">{t('subtitle')}</p>
        </div>
        <RegisterForm
          action={registerAction.bind(null, locale, callbackUrl)}
          loginHref={loginHref}
        />
      </div>
    </section>
  );
}
