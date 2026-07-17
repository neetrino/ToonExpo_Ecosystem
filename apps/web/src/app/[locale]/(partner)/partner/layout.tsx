'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, type ReactNode } from 'react';

import { Link } from '@/i18n/navigation';
import {
  assertPartnerSession,
  type PartnerSessionContext,
} from '@/lib/partner/assert-partner-session';

type PartnerCabinetLayoutProps = {
  children: ReactNode;
};

export default function PartnerCabinetLayout({ children }: PartnerCabinetLayoutProps) {
  const t = useTranslations('partnerCabinet');
  const [context, setContext] = useState<PartnerSessionContext | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const ctx = await assertPartnerSession();
      if (cancelled) {
        return;
      }
      setContext(ctx);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (context === undefined) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-[var(--te-muted)]" role="status">
        Loading…
      </div>
    );
  }

  if (!context) {
    return (
      <div className="portal-shell">
        <section>
          <h1 className="portal-page__title">{t('unlinked.title')}</h1>
          <p className="portal-muted">{t('unlinked.description')}</p>
        </section>
      </div>
    );
  }

  const showOffers = context.partner.type === 'BANK';

  return (
    <div className="portal-shell">
      <header className="portal-shell__header">
        <div className="portal-shell__heading">
          <h1 className="portal-shell__company">{context.partner.name}</h1>
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
