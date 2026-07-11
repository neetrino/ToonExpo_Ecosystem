import { auth } from '@/auth';
import { getBuyerDeals, type BuyerDealRow } from '@/lib/crm/buyer-deals-queries';
import type { DealStage, RequestSource } from '@toonexpo/domain';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type BuyerPageProps = {
  params: Promise<{ locale: string }>;
};

function formatDate(value: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

function BuyerDealsTable({
  deals,
  locale,
  labels,
  stageLabels,
  sourceLabels,
}: {
  deals: BuyerDealRow[];
  locale: string;
  labels: {
    company: string;
    project: string;
    stage: string;
    source: string;
    createdAt: string;
    lastActivityAt: string;
    noValue: string;
  };
  stageLabels: Record<DealStage, string>;
  sourceLabels: Record<RequestSource, string>;
}) {
  return (
    <div className="buyer-deals-table-wrap">
      <table className="buyer-deals-table">
        <thead>
          <tr>
            <th>{labels.company}</th>
            <th>{labels.project}</th>
            <th>{labels.stage}</th>
            <th>{labels.source}</th>
            <th>{labels.createdAt}</th>
            <th>{labels.lastActivityAt}</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => (
            <tr key={deal.id}>
              <td>{deal.companyName}</td>
              <td>{deal.projectName ?? labels.noValue}</td>
              <td>{stageLabels[deal.stage]}</td>
              <td>{sourceLabels[deal.source]}</td>
              <td>{formatDate(deal.createdAt, locale)}</td>
              <td>
                {deal.lastActivityAt ? formatDate(deal.lastActivityAt, locale) : labels.noValue}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function BuyerAccountPage({ params }: BuyerPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('buyer.account');

  const session = await auth();
  const buyerUserId = session?.user?.id;
  const deals = buyerUserId ? await getBuyerDeals(buyerUserId) : [];

  const stageLabels = Object.fromEntries(
    (
      [
        'NEW_REQUEST',
        'ASSIGNED',
        'CONTACTED',
        'FOLLOW_UP_NEEDED',
        'APARTMENT_SELECTED',
        'RESERVED',
        'CONVERTED',
        'CLOSED',
        'LOST',
      ] as const
    ).map((stage) => [stage, t(`stages.${stage}`)]),
  ) as Record<DealStage, string>;

  const sourceLabels = Object.fromEntries(
    (
      [
        'PROJECT_PAGE',
        'APARTMENT_PAGE',
        'BUILDER_QR_SCAN',
        'MANUAL_BUILDER_ENTRY',
        'EVENT_INTERACTION',
      ] as const
    ).map((source) => [source, t(`sources.${source}`)]),
  ) as Record<RequestSource, string>;

  const tableLabels = {
    company: t('columns.company'),
    project: t('columns.project'),
    stage: t('columns.stage'),
    source: t('columns.source'),
    createdAt: t('columns.createdAt'),
    lastActivityAt: t('columns.lastActivityAt'),
    noValue: t('noValue'),
  };

  return (
    <section className="buyer-account">
      <header className="buyer-account__header">
        <h1 className="buyer-account__title">{t('title')}</h1>
        <p className="buyer-account__subtitle">{t('subtitle')}</p>
      </header>

      {deals.length === 0 ? (
        <p className="buyer-account__empty">{t('empty')}</p>
      ) : (
        <BuyerDealsTable
          deals={deals}
          locale={locale}
          labels={tableLabels}
          stageLabels={stageLabels}
          sourceLabels={sourceLabels}
        />
      )}
    </section>
  );
}
