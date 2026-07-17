'use client';

import type { ApartmentStatus, RequestSource } from '@toonexpo/domain';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { BuyerQrSection } from '@/components/buyer/buyer-qr-section';
import { useSession } from '@/components/auth/session-provider';
import { DataRefreshProvider } from '@/components/portal-forms/data-refresh-context';
import { getBuyerProfile } from '@/lib/buyer/profile-mutations';
import { BUYER_FACING_STATUSES, type BuyerFacingStatus } from '@/lib/crm/buyer-facing-status';
import { getBuyerDeals, type BuyerDealRow } from '@/lib/crm/buyer-deals-queries';
import { loadWebEnv } from '@/lib/env';
import { loadBuyerCheckIns } from '@/lib/exhibition/queries';
import { listBuyerFavorites } from '@/lib/favorites/queries';
import type { FavoriteListItem } from '@toonexpo/contracts';
import { buildQrPayloadUrl, renderQrSvg } from '@/lib/qr/image';
import { ensureBuyerQr } from '@/lib/qr/mutations';

import { BuyerDealsTable } from './buyer-deals-table';
import { BuyerFavoritesSection } from './buyer-favorites-section';
import { BuyerProfileSection } from './buyer-profile-section';

const REQUEST_SOURCES_ORDER = [
  'PROJECT_PAGE',
  'APARTMENT_PAGE',
  'BUILDER_QR_SCAN',
  'MANUAL_BUILDER_ENTRY',
  'EVENT_INTERACTION',
] as const satisfies readonly RequestSource[];

type BuyerQrDisplay = {
  qrSvg: string | null;
  payloadUrl: string | null;
  revoked: boolean;
};

type CheckInRow = { id: string; eventName: string; checkedInAt: Date };

async function loadBuyerQrDisplay(userId: string, locale: string): Promise<BuyerQrDisplay> {
  const qrState = await ensureBuyerQr(userId);
  if (!qrState.ok) {
    return { qrSvg: null, payloadUrl: null, revoked: false };
  }
  if (qrState.revoked) {
    return { qrSvg: null, payloadUrl: null, revoked: true };
  }

  const env = loadWebEnv();
  const payloadUrl = buildQrPayloadUrl(qrState.token, locale, env.APP_URL);
  const qrSvg = await renderQrSvg(payloadUrl);
  return { qrSvg, payloadUrl, revoked: false };
}

export function BuyerAccountClient() {
  const locale = useLocale();
  const t = useTranslations('buyer.account');
  const tCatalog = useTranslations('catalog');
  const { status, user } = useSession();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getBuyerProfile>>>(null);
  const [deals, setDeals] = useState<BuyerDealRow[]>([]);
  const [favorites, setFavorites] = useState<FavoriteListItem[]>([]);
  const [checkIns, setCheckIns] = useState<CheckInRow[]>([]);
  const [qr, setQr] = useState<BuyerQrDisplay>({ qrSvg: null, payloadUrl: null, revoked: false });

  const loadAccount = useCallback(async () => {
    if (status !== 'authenticated' || !user) {
      return;
    }
    const [nextProfile, nextDeals, nextFavorites, nextCheckIns, nextQr] = await Promise.all([
      getBuyerProfile(),
      getBuyerDeals(user.id),
      listBuyerFavorites(),
      loadBuyerCheckIns(user.id),
      loadBuyerQrDisplay(user.id, locale),
    ]);
    setProfile(nextProfile);
    setDeals(nextDeals);
    setFavorites(nextFavorites);
    setCheckIns(nextCheckIns);
    setQr(nextQr);
    setReady(true);
  }, [locale, status, user]);

  useEffect(() => {
    if (status !== 'authenticated' || !user) {
      return;
    }
    void loadAccount();
  }, [loadAccount, status, user]);

  if (status === 'loading' || !ready) {
    return (
      <div className="buyer-account mx-auto max-w-7xl px-6 py-16 text-sm text-[var(--te-muted)]">
        Loading…
      </div>
    );
  }

  const statusLabels = Object.fromEntries(
    BUYER_FACING_STATUSES.map((s) => [s, t(`statuses.${s}`)]),
  ) as Record<BuyerFacingStatus, string>;
  const apartmentStatusLabels: Record<ApartmentStatus, string> = {
    AVAILABLE: tCatalog('apartmentStatus.AVAILABLE'),
    RESERVED: tCatalog('apartmentStatus.RESERVED'),
    SOLD: tCatalog('apartmentStatus.SOLD'),
  };
  const sourceLabels = Object.fromEntries(
    REQUEST_SOURCES_ORDER.map((source) => [source, t(`sources.${source}`)]),
  ) as Record<RequestSource, string>;
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <DataRefreshProvider refresh={loadAccount}>
      <section className="buyer-account">
        <header className="buyer-account__header">
          <h1 className="buyer-account__title">{t('title')}</h1>
          <p className="buyer-account__subtitle">{t('subtitle')}</p>
        </header>

        {profile ? <BuyerProfileSection locale={locale} profile={profile} /> : null}

        <BuyerQrSection
          locale={locale}
          qrSvg={qr.qrSvg}
          revoked={qr.revoked}
          payloadUrl={qr.payloadUrl}
        />

        <BuyerFavoritesSection
          locale={locale}
          favorites={favorites}
          statusLabels={apartmentStatusLabels}
        />

        <section className="buyer-account__checkins" aria-labelledby="buyer-checkins-heading">
          <h2 id="buyer-checkins-heading" className="buyer-account__section-title">
            {t('checkinsHeading')}
          </h2>
          {checkIns.length === 0 ? (
            <p className="buyer-account__empty">{t('checkinsEmpty')}</p>
          ) : (
            <ul className="buyer-account__checkin-list">
              {checkIns.map((row) => (
                <li key={row.id}>
                  <span>{row.eventName}</span>
                  <span className="buyer-account__checkin-meta">
                    {dateFormatter.format(row.checkedInAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="buyer-account__requests" aria-labelledby="buyer-requests-heading">
          <h2 id="buyer-requests-heading" className="buyer-account__section-title">
            {t('requestsHeading')}
          </h2>
          {deals.length === 0 ? (
            <p className="buyer-account__empty">{t('empty')}</p>
          ) : (
            <BuyerDealsTable
              deals={deals}
              locale={locale}
              labels={{
                company: t('columns.company'),
                project: t('columns.project'),
                status: t('columns.status'),
                source: t('columns.source'),
                createdAt: t('columns.createdAt'),
                lastActivityAt: t('columns.lastActivityAt'),
                noValue: t('noValue'),
              }}
              statusLabels={statusLabels}
              sourceLabels={sourceLabels}
            />
          )}
        </section>
      </section>
    </DataRefreshProvider>
  );
}
