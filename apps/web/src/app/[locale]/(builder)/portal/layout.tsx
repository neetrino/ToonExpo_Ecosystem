'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

import { ActingOnBehalfBanner } from '@/components/portal/acting-on-behalf-banner';
import { CompanySwitcher } from '@/components/portal/company-switcher';
import { useSession } from '@/components/auth/session-provider';
import { Link } from '@/i18n/navigation';
import { LOGIN_PATH } from '@/lib/auth/constants';
import {
  assertBuilderSession,
  type BuilderSessionContext,
} from '@/lib/builder/assert-builder-session';
import { loadAdminCompanyOptions, loadBuilderCompanyOptions } from '@/lib/builder/company-options';
import type { PortalCompanyOption } from '@/lib/builder/company-options';

type PortalLayoutProps = {
  children: ReactNode;
};

export default function PortalLayout({ children }: PortalLayoutProps) {
  const locale = useLocale();
  const router = useRouter();
  const { status, user } = useSession();
  const t = useTranslations('portal');
  const [context, setContext] = useState<BuilderSessionContext | null>(null);
  const [companies, setCompanies] = useState<PortalCompanyOption[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }
    if (status === 'unauthenticated' || !user) {
      router.replace(`/${locale}${LOGIN_PATH}`);
      return;
    }

    let cancelled = false;
    void (async () => {
      const builderContext = await assertBuilderSession();
      if (cancelled) {
        return;
      }
      if (!builderContext) {
        if (user.role === 'BIGPROJECTS_ADMIN') {
          router.replace(`/${locale}/admin/companies`);
        } else {
          router.replace(`/${locale}${LOGIN_PATH}`);
        }
        return;
      }

      const options = builderContext.actingOnBehalf
        ? await loadAdminCompanyOptions()
        : await loadBuilderCompanyOptions(builderContext.session.user.id);
      if (cancelled) {
        return;
      }
      setContext(builderContext);
      setCompanies(options);
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [locale, router, status, user]);

  if (!ready || !context) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-[var(--te-muted)]" role="status">
        Loading…
      </div>
    );
  }

  const showSwitcher = companies.length > 1;

  return (
    <div className="portal-shell">
      {context.actingOnBehalf ? (
        <ActingOnBehalfBanner
          locale={locale}
          message={t('actingOnBehalf.message', { company: context.companyName })}
          exitLabel={t('actingOnBehalf.exit')}
        />
      ) : null}
      <header className="portal-shell__header">
        <div className="portal-shell__heading">
          {showSwitcher ? (
            <CompanySwitcher
              locale={locale}
              activeCompanyId={context.companyId}
              companies={companies}
              label={t('companySwitcher.label')}
              ariaLabel={t('companySwitcher.ariaLabel')}
            />
          ) : (
            <h1 className="portal-shell__company">{context.companyName}</h1>
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
