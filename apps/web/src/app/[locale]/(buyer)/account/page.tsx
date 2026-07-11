import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { DealStage, RequestSource } from '@toonexpo/domain';

import { auth } from '@/auth';
import { BuyerQrSection } from '@/components/buyer/buyer-qr-section';
import { getBuyerDeals, type BuyerDealRow } from '@/lib/crm/buyer-deals-queries';
import { loadWebEnv } from '@/lib/env';
import { buildQrPayloadUrl, renderQrSvg } from '@/lib/qr/image';
import { ensureBuyerQr } from '@/lib/qr/mutations';

import { BuyerDealsTable } from './buyer-deals-table';

type BuyerPageProps = {
  params: Promise<{ locale: string }>;
};

const DEAL_STAGES_ORDER = [
  'NEW_REQUEST',
  'ASSIGNED',
  'CONTACTED',
  'FOLLOW_UP_NEEDED',
  'APARTMENT_SELECTED',
  'RESERVED',
  'CONVERTED',
  'CLOSED',
  'LOST',
] as const satisfies readonly DealStage[];

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

  const session = await auth();
  const buyerUserId = session?.user?.id;
  const deals: BuyerDealRow[] = buyerUserId ? await getBuyerDeals(buyerUserId) : [];
  const qr = buyerUserId
    ? await loadBuyerQrDisplay(buyerUserId, locale)
    : { qrSvg: null, payloadUrl: null, revoked: false };

  const stageLabels = Object.fromEntries(
    DEAL_STAGES_ORDER.map((stage) => [stage, t(`stages.${stage}`)]),
  ) as Record<DealStage, string>;
  const sourceLabels = Object.fromEntries(
    REQUEST_SOURCES_ORDER.map((source) => [source, t(`sources.${source}`)]),
  ) as Record<RequestSource, string>;

  return (
    <section className="buyer-account">
      <header className="buyer-account__header">
        <h1 className="buyer-account__title">{t('title')}</h1>
        <p className="buyer-account__subtitle">{t('subtitle')}</p>
      </header>

      {buyerUserId ? (
        <BuyerQrSection
          locale={locale}
          qrSvg={qr.qrSvg}
          revoked={qr.revoked}
          payloadUrl={qr.payloadUrl}
        />
      ) : null}

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
              stage: t('columns.stage'),
              source: t('columns.source'),
              createdAt: t('columns.createdAt'),
              lastActivityAt: t('columns.lastActivityAt'),
              noValue: t('noValue'),
            }}
            stageLabels={stageLabels}
            sourceLabels={sourceLabels}
          />
        )}
      </section>
    </section>
  );
}
