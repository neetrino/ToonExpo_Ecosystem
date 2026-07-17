'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { assertPartnerSession } from '@/lib/partner/assert-partner-session';
import {
  loadOwnPartnerDetail,
  type PartnerCabinetBankOffer,
} from '@/lib/partner/queries';

import { PartnerBankOffersSection } from './bank-offers-section';

export function PartnerOffersClient() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('partnerCabinet.offers');
  const tStatus = useTranslations('partnerCabinet.status');
  const [offers, setOffers] = useState<PartnerCabinetBankOffer[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const ctx = await assertPartnerSession();
      if (cancelled) {
        return;
      }
      if (!ctx) {
        setOffers([]);
        return;
      }
      if (ctx.partner.type !== 'BANK') {
        router.replace(`/${locale}/partner`);
        return;
      }
      const detail = await loadOwnPartnerDetail(ctx.partnerId);
      if (cancelled) {
        return;
      }
      setOffers(detail?.bankOffers ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, [locale, router]);

  if (!offers) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-[var(--te-muted)]" role="status">
        Loading…
      </div>
    );
  }

  return (
    <section>
      <div className="portal-page__header">
        <div>
          <h2 className="portal-page__title">{t('title')}</h2>
          <p className="portal-page__subtitle">{t('subtitle')}</p>
        </div>
      </div>

      <PartnerBankOffersSection
        locale={locale}
        offers={offers}
        labels={{
          title: t('sectionTitle'),
          empty: t('empty'),
          newOffer: t('newOffer'),
          edit: t('edit'),
          featured: t('featured'),
          columns: {
            title: t('columns.title'),
            rate: t('columns.rate'),
            term: t('columns.term'),
            amount: t('columns.amount'),
            status: t('columns.status'),
            actions: t('columns.actions'),
          },
          status: {
            DRAFT: tStatus('DRAFT'),
            PUBLISHED: tStatus('PUBLISHED'),
            ARCHIVED: tStatus('ARCHIVED'),
          },
        }}
      />
    </section>
  );
}
