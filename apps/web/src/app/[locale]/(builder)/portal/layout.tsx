import type { ReactNode } from 'react';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Link, redirect } from '@/i18n/navigation';
import { LOGIN_PATH } from '@/lib/auth/constants';
import { assertBuilderSession } from '@/lib/builder/assert-builder-session';

type PortalLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function PortalLayout({ children, params }: PortalLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const builderContext = await assertBuilderSession();
  if (!builderContext) {
    return redirect({ href: LOGIN_PATH, locale });
  }

  const t = await getTranslations('portal.nav');

  return (
    <div className="portal-shell">
      <header className="portal-shell__header">
        <h1 className="portal-shell__company">{builderContext.companyName}</h1>
        <nav className="portal-nav" aria-label={t('ariaLabel')}>
          <Link className="portal-nav__link" href="/portal">
            {t('overview')}
          </Link>
          <Link className="portal-nav__link" href="/portal/projects">
            {t('projects')}
          </Link>
          <Link className="portal-nav__link" href="/portal/crm">
            {t('crm')}
          </Link>
          <Link className="portal-nav__link" href="/portal/readiness">
            {t('readiness')}
          </Link>
          <Link className="portal-nav__link" href="/portal/analytics">
            {t('analytics')}
          </Link>
          <Link className="portal-nav__link" href="/portal/company">
            {t('company')}
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
