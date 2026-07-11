import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';

import { Link } from '@/i18n/navigation';

type AdminLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminAreaLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin.nav');

  return (
    <div className="portal-shell">
      <header className="portal-shell__header">
        <h1 className="portal-shell__company">{t('title')}</h1>
        <nav className="portal-nav" aria-label={t('ariaLabel')}>
          <Link className="portal-nav__link" href="/admin">
            {t('provisioning')}
          </Link>
          <Link className="portal-nav__link" href="/admin/companies">
            {t('companies')}
          </Link>
          <Link className="portal-nav__link" href="/admin/projects">
            {t('projects')}
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
