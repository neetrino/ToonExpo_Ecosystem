import type { ReactNode } from 'react';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { assertPartnerSession } from '@/lib/partner/assert-partner-session';

type PartnerCabinetLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function PartnerCabinetLayout({
  children,
  params,
}: PartnerCabinetLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const ctx = await assertPartnerSession();
  const t = await getTranslations('partnerCabinet');

  if (!ctx) {
    return (
      <div className="portal-shell">
        <section>
          <h1 className="portal-page__title">{t('unlinked.title')}</h1>
          <p className="portal-muted">{t('unlinked.description')}</p>
        </section>
      </div>
    );
  }

  const showOffers = ctx.partner.type === 'BANK';

  return (
    <div className="portal-shell">
      <header className="portal-shell__header">
        <div className="portal-shell__heading">
          <h1 className="portal-shell__company">{ctx.partner.name}</h1>
        </div>
        <nav className="portal-nav" aria-label={t('nav.ariaLabel')}>
          <Link className="portal-nav__link" href="/partner">
            {t('nav.overview')}
          </Link>
          <Link className="portal-nav__link" href="/partner/profile">
            {t('nav.profile')}
          </Link>
          {showOffers ? (
            <Link className="portal-nav__link" href="/partner/offers">
              {t('nav.offers')}
            </Link>
          ) : null}
        </nav>
      </header>
      {children}
    </div>
  );
}
