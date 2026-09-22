'use client';

import type { CrmDealDetail } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';

import {
  remainingPaymentAmount,
  sumPaymentAmounts,
} from '@/features/builder/utils/crm-payment-totals';
import { formatBuyerDateTime } from '@/features/buyer/utils/format-datetime';
import { AMD_CURRENCY_CODE } from '@/features/catalog/utils/display-currency';
import { formatCatalogPrice } from '@/features/catalog/utils/format-price';

type CrmDealPaymentsReadonlyProps = {
  deal: CrmDealDetail;
};

const formatAmount = (
  amount: string | null,
  currency: string,
  locale: string,
  emptyLabel: string,
): string =>
  formatCatalogPrice({
    amount,
    currency,
    locale,
    onRequestLabel: emptyLabel,
  });

/**
 * Read-only apartment price, paid total, and payment history.
 */
export const CrmDealPaymentsReadonly = ({ deal }: CrmDealPaymentsReadonlyProps) => {
  const t = useTranslations('CrmBoard.payments');
  const locale = useLocale();
  const apartment = deal.apartments[0];
  const currency = apartment?.priceCurrency ?? AMD_CURRENCY_CODE;
  const paidTotal = sumPaymentAmounts(deal.payments);
  const remaining = remainingPaymentAmount(apartment?.price ?? null, paidTotal);

  if (!apartment) {
    return <p className="text-sm text-ink-muted">{t('noApartment')}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-sm bg-surface px-3 py-2">
          <dt className="text-xs text-ink-muted">{t('apartmentPrice')}</dt>
          <dd className="font-medium text-ink">
            {formatAmount(apartment.price, currency, locale, t('priceEmpty'))}
          </dd>
        </div>
        <div className="rounded-sm bg-surface px-3 py-2">
          <dt className="text-xs text-ink-muted">{t('paidTotal')}</dt>
          <dd className="font-medium text-ink">
            {formatAmount(String(paidTotal), currency, locale, t('priceEmpty'))}
          </dd>
        </div>
        <div className="rounded-sm bg-surface px-3 py-2">
          <dt className="text-xs text-ink-muted">{t('remaining')}</dt>
          <dd className="font-medium text-ink">
            {remaining == null
              ? t('priceEmpty')
              : formatAmount(String(remaining), currency, locale, t('priceEmpty'))}
          </dd>
        </div>
      </dl>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-ink">{t('historyTitle')}</h3>
        {deal.payments.length === 0 ? (
          <p className="text-sm text-ink-muted">{t('historyEmpty')}</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-ink-muted">
                <th className="py-2 font-medium">{t('columns.date')}</th>
                <th className="py-2 font-medium">{t('columns.amount')}</th>
                <th className="py-2 font-medium">{t('columns.by')}</th>
                <th className="py-2 font-medium">{t('columns.note')}</th>
              </tr>
            </thead>
            <tbody>
              {deal.payments.map((payment) => (
                <tr key={payment.id} className="border-b border-border/70">
                  <td className="py-2 text-ink-secondary">
                    {formatBuyerDateTime(payment.createdAt, locale)}
                  </td>
                  <td className="py-2 font-medium text-ink">
                    {formatAmount(payment.amount, payment.currency, locale, t('priceEmpty'))}
                  </td>
                  <td className="py-2 text-ink-secondary">{payment.createdByName}</td>
                  <td className="py-2 text-ink-muted">{payment.note ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
