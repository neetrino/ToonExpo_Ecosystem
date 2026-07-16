import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { RequestSource } from '@toonexpo/domain';

import { auth } from '@/auth';
import { BuyerQrSection } from '@/components/buyer/buyer-qr-section';
import { BUYER_FACING_STATUSES, type BuyerFacingStatus } from '@/lib/crm/buyer-facing-status';
import { getBuyerDeals, type BuyerDealRow } from '@/lib/crm/buyer-deals-queries';
import { loadBuyerCheckIns } from '@/lib/exhibition/queries';
import { loadWebEnv } from '@/lib/env';
import { listBuyerFavorites } from '@/lib/favorites/queries';
import { buildQrPayloadUrl, renderQrSvg } from '@/lib/qr/image';
import { ensureBuyerQr } from '@/lib/qr/mutations';
import { getBuyerProfile } from '@/lib/buyer/profile-mutations';
import type { ApartmentStatus } from '@toonexpo/domain';

import { BuyerDealsTable } from './buyer-deals-table';
import { BuyerFavoritesSection } from './buyer-favorites-section';
import { BuyerProfileSection } from './buyer-profile-section';

type BuyerPageProps = {
  params: Promise<{ locale: string }>;
};

const REQUEST_SOURCES_ORDER = [
  'PROJECT_PAGE',
  'APARTMENT_PAGE',
  'BUILDER_QR_SCAN',
  'MANUAL_BUILDER_ENTRY',
  'EVENT_INTERACTION',
] as const satisfies readonly RequestSource[];

async function loadBuyerQrDisplay(userId: string, locale: string) {
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

export default async function BuyerAccountPage({ params }: BuyerPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('buyer.account');
  const tCatalog = await getTranslations('catalog');

  const session = await auth();
  const buyerUserId = session?.user?.id;
  const profile = buyerUserId ? await getBuyerProfile(buyerUserId) : null;
  const deals: BuyerDealRow[] = buyerUserId ? await getBuyerDeals(buyerUserId) : [];
  const favorites = buyerUserId ? await listBuyerFavorites(buyerUserId) : [];
  const checkIns = buyerUserId ? await loadBuyerCheckIns(buyerUserId) : [];
  const qr = buyerUserId
    ? await loadBuyerQrDisplay(buyerUserId, locale)
    : { qrSvg: null, payloadUrl: null, revoked: false };

  const statusLabels = Object.fromEntries(
    BUYER_FACING_STATUSES.map((status) => [status, t(`statuses.${status}`)]),
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
    <section className="buyer-account">
      <header className="buyer-account__header">
        <h1 className="buyer-account__title">{t('title')}</h1>
        <p className="buyer-account__subtitle">{t('subtitle')}</p>
      </header>

      {profile ? <BuyerProfileSection locale={locale} profile={profile} /> : null}

      {buyerUserId ? (
        <BuyerQrSection
          locale={locale}
          qrSvg={qr.qrSvg}
          revoked={qr.revoked}
          payloadUrl={qr.payloadUrl}
        />
      ) : null}

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
  );
}
