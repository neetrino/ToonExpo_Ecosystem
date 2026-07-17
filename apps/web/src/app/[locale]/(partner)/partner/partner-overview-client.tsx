'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Link } from '@/i18n/navigation';
import {
  assertPartnerSession,
  type PartnerSessionPartner,
} from '@/lib/partner/assert-partner-session';

export function PartnerOverviewClient() {
  const t = useTranslations('partnerCabinet.overview');
  const tTypes = useTranslations('partnerCabinet.types');
  const tStatus = useTranslations('partnerCabinet.status');
  const [partner, setPartner] = useState<PartnerSessionPartner | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const ctx = await assertPartnerSession();
      if (cancelled) {
        return;
      }
      setPartner(ctx?.partner ?? null);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-[var(--te-muted)]" role="status">
        Loading…
      </div>
    );
  }

  if (!partner) {
    return null;
  }

  const publicHref = `/partners/${partner.slug}`;

  return (
    <section>
      <div className="portal-page__header">
        <div>
          <h2 className="portal-page__title">{t('title')}</h2>
          <p className="portal-page__subtitle">{t('subtitle')}</p>
        </div>
      </div>

      <dl className="portal-dl">
        <div>
          <dt>{t('fields.name')}</dt>
          <dd>{partner.name}</dd>
        </div>
        <div>
          <dt>{t('fields.type')}</dt>
          <dd>{tTypes(partner.type)}</dd>
        </div>
        <div>
          <dt>{t('fields.status')}</dt>
          <dd>
            <span className={`portal-badge portal-badge--${partner.status.toLowerCase()}`}>
              {tStatus(partner.status)}
            </span>
          </dd>
        </div>
        <div>
          <dt>{t('fields.publicLink')}</dt>
          <dd>
            {partner.status === 'PUBLISHED' ? (
              <Link href={publicHref}>{t('viewPublic')}</Link>
            ) : (
              <span className="portal-muted">{t('notPublicYet')}</span>
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}
