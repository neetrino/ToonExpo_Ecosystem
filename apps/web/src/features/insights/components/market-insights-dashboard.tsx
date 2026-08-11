import { getLocale, getTranslations } from 'next-intl/server';

import { MarketPriceTrendChart } from '@/features/insights/components/market-price-trend-chart';
import {
  MARKET_AVG_PER_SQM_AMD,
  MARKET_AVG_YOY_PERCENT,
  MARKET_CITY_ROWS,
  MARKET_DEMAND_INDEX,
  MARKET_DEMAND_MAX,
  MARKET_MEDIAN_DAYS,
  MARKET_MORTGAGE_RATE,
  MARKET_MORTGAGE_WEEKLY_DELTA,
  MARKET_PRICE_TREND,
} from '@/features/insights/constants/market-insights-data';
import { cn } from '@/shared/ui/cn';

const formatAmdInteger = (value: number, locale: string): string =>
  new Intl.NumberFormat(locale).format(Math.round(value));

const formatSignedPercent = (value: number, locale: string): string => {
  const absolute = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(value));
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${absolute}%`;
};

/**
 * Market insights dashboard — national pulse card, side metrics, cities table.
 */
export const MarketInsightsDashboard = async () => {
  const t = await getTranslations('MarketInsights');
  const locale = await getLocale();
  const monthLabels = MARKET_PRICE_TREND.map((point) => t(`months.${point.monthKey}`));

  return (
    <section className="page-container py-12 pb-24 sm:py-16">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-5">
        <article
          className={cn(
            'rounded-[24px] border border-header-border bg-surface-elevated p-6 sm:p-8',
            'shadow-[0_12px_30px_-18px_rgb(9_43_68/0.25)]',
          )}
        >
          <p className="text-[11px] font-bold tracking-[0.14em] text-header-muted uppercase">
            {t('nationalAvg.label')}
          </p>
          <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">
            <p className="font-brand text-[clamp(2rem,1.4rem+2.5vw,2.75rem)] font-bold leading-none tracking-tight text-ink-navy">
              {formatAmdInteger(MARKET_AVG_PER_SQM_AMD, locale)} ֏
            </p>
            <p className="pb-1 text-sm font-semibold text-success">
              {t('nationalAvg.yoy', {
                value: formatSignedPercent(MARKET_AVG_YOY_PERCENT, locale),
              })}
            </p>
          </div>
          <p className="mt-3 max-w-xl text-sm leading-6 text-header-muted">
            {t('nationalAvg.description')}
          </p>
          <MarketPriceTrendChart
            className="mt-8"
            points={MARKET_PRICE_TREND}
            monthLabels={monthLabels}
            ariaLabel={t('nationalAvg.chartAria')}
          />
        </article>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:gap-5">
          <InsightMetricCard
            label={t('metrics.mortgageRate.label')}
            value={`${MARKET_MORTGAGE_RATE.toFixed(2)}%`}
            hint={t('metrics.mortgageRate.hint', {
              value: formatSignedPercent(MARKET_MORTGAGE_WEEKLY_DELTA, locale),
            })}
            tone="caution"
          />
          <InsightMetricCard
            label={t('metrics.daysOnMarket.label')}
            value={formatAmdInteger(MARKET_MEDIAN_DAYS, locale)}
            hint={t('metrics.daysOnMarket.hint')}
            tone="positive"
          />
          <InsightMetricCard
            label={t('metrics.demand.label')}
            value={`${MARKET_DEMAND_INDEX.toFixed(1)} / ${MARKET_DEMAND_MAX}`}
            hint={t('metrics.demand.hint')}
            tone="positive"
          />
        </div>
      </div>

      <div className="mt-12 sm:mt-14">
        <h2 className="font-brand text-2xl font-bold tracking-tight text-ink-navy sm:text-[1.75rem]">
          {t('cities.title')}
        </h2>
        <div className="mt-5 overflow-x-auto rounded-[20px] border border-header-border bg-surface-elevated">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-header-border bg-band-mist/25 text-[11px] font-bold tracking-[0.08em] text-header-muted uppercase">
                <th className="px-4 py-3.5 font-bold sm:px-5">{t('cities.columns.city')}</th>
                <th className="px-4 py-3.5 font-bold sm:px-5">{t('cities.columns.listings')}</th>
                <th className="px-4 py-3.5 font-bold sm:px-5">{t('cities.columns.avg')}</th>
                <th className="px-4 py-3.5 font-bold sm:px-5">{t('cities.columns.yoy')}</th>
                <th className="px-4 py-3.5 font-bold sm:px-5">{t('cities.columns.demand')}</th>
              </tr>
            </thead>
            <tbody>
              {MARKET_CITY_ROWS.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-header-border last:border-b-0 odd:bg-canvas/60"
                >
                  <td className="px-4 py-3.5 font-semibold text-ink-navy sm:px-5">
                    {t(`cities.names.${row.cityKey}`)}
                  </td>
                  <td className="px-4 py-3.5 text-header-muted sm:px-5">
                    {formatAmdInteger(row.activeListings, locale)}
                  </td>
                  <td className="px-4 py-3.5 text-ink-navy sm:px-5">
                    {formatAmdInteger(row.avgPerSqm, locale)} ֏
                  </td>
                  <td className="px-4 py-3.5 font-medium text-success sm:px-5">
                    {formatSignedPercent(row.yoyChangePercent, locale)}
                  </td>
                  <td className="px-4 py-3.5 text-ink-navy sm:px-5">
                    {row.demand.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

type InsightMetricCardProps = {
  label: string;
  value: string;
  hint: string;
  tone: 'positive' | 'caution';
};

const InsightMetricCard = ({ label, value, hint, tone }: InsightMetricCardProps) => (
  <article
    className={cn(
      'rounded-[24px] border border-header-border bg-surface-elevated p-5 sm:p-6',
      'shadow-[0_12px_30px_-18px_rgb(9_43_68/0.2)]',
    )}
  >
    <p className="text-[11px] font-bold tracking-[0.14em] text-header-muted uppercase">{label}</p>
    <p className="mt-3 font-brand text-[clamp(1.75rem,1.3rem+1.5vw,2.25rem)] font-bold leading-none tracking-tight text-ink-navy">
      {value}
    </p>
    <p
      className={cn(
        'mt-2 text-sm font-medium',
        tone === 'positive' ? 'text-success' : 'text-warning',
      )}
    >
      {hint}
    </p>
  </article>
);
