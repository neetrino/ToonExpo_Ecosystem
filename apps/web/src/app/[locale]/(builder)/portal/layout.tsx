import type { ReactNode } from 'react';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { auth } from '@/auth';
import { ActingOnBehalfBanner } from '@/components/portal/acting-on-behalf-banner';
import { CompanySwitcher } from '@/components/portal/company-switcher';
import { Link, redirect } from '@/i18n/navigation';
import { LOGIN_PATH } from '@/lib/auth/constants';
import { assertBuilderSession } from '@/lib/builder/assert-builder-session';
import { loadAdminCompanyOptions, loadBuilderCompanyOptions } from '@/lib/builder/company-options';

type PortalLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function PortalLayout({ children, params }: PortalLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const builderContext = await assertBuilderSession();
  if (!builderContext) {
    const session = await auth();
    if (session?.user?.role === 'BIGPROJECTS_ADMIN') {
      return redirect({ href: '/admin/companies', locale });
    }
    return redirect({ href: LOGIN_PATH, locale });
  }

  const t = await getTranslations('portal');
  const companies = builderContext.actingOnBehalf
    ? await loadAdminCompanyOptions()
    : await loadBuilderCompanyOptions(builderContext.session.user.id);

  const showSwitcher = companies.length > 1;

  return (
    <div className="portal-shell">
      {builderContext.actingOnBehalf ? (
        <ActingOnBehalfBanner
          locale={locale}
          message={t('actingOnBehalf.message', { company: builderContext.companyName })}
          exitLabel={t('actingOnBehalf.exit')}
        />
      ) : null}
      <header className="portal-shell__header">
        <div className="portal-shell__heading">
          {showSwitcher ? (
            <CompanySwitcher
              locale={locale}
              activeCompanyId={builderContext.companyId}
              companies={companies}
              label={t('companySwitcher.label')}
              ariaLabel={t('companySwitcher.ariaLabel')}
            />
          ) : (
            <h1 className="portal-shell__company">{builderContext.companyName}</h1>
          )}
        </div>
        <nav className="portal-nav" aria-label={t('nav.ariaLabel')}>
          <Link className="portal-nav__link" href="/portal">
            {t('nav.overview')}
          </Link>
          <Link className="portal-nav__link" href="/portal/projects">
            {t('nav.projects')}
          </Link>
          <Link className="portal-nav__link" href="/portal/crm">
            {t('nav.crm')}
          </Link>
          <Link className="portal-nav__link" href="/portal/readiness">
            {t('nav.readiness')}
          </Link>
          <Link className="portal-nav__link" href="/portal/analytics">
            {t('nav.analytics')}
          </Link>
          <Link className="portal-nav__link" href="/portal/company">
            {t('nav.company')}
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
