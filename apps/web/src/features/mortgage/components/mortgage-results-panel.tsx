'use client';

import { useLocale, useTranslations } from 'next-intl';

import type { MortgagePaymentEstimate } from '@/features/mortgage/utils/estimate-monthly-payment';
import { formatMortgageAmount } from '@/features/mortgage/utils/format-mortgage-amount';
import { cn } from '@/shared/ui/cn';

type MortgageResultsPanelProps = {
  /** Live client estimate — updates immediately as inputs change. */
  estimate: MortgagePaymentEstimate | null;
  bankName: string;
  hasValidationError: boolean;
};

/**
 * Dark summary card inside “Your loan” — Figma `105:2589`.
 * Keeps the same card mounted and only swaps figures (no flash on recalculate).
 */
export const MortgageResultsPanel = ({
  estimate,
  bankName,
  hasValidationError,
}: MortgageResultsPanelProps) => {
  const t = useTranslations('Mortgage.calculator');
  const locale = useLocale();

  if (hasValidationError) {
    return <StatusCard message={t('fixInputs')} />;
  }

  if (!estimate) {
    return <StatusCard message={t('enterInputs')} />;
  }

  return (
    <div className="rounded-[20px] bg-brand-deep p-6 text-on-dark">
      <p className="text-[10px] font-bold tracking-widest text-on-dark/60 uppercase">
        {t('monthlyPaymentWithBank', { bank: bankName })}
      </p>
      <p className="mt-2 font-brand text-4xl font-bold leading-10 tracking-tight tabular-nums">
        {formatMortgageAmount(estimate.monthlyPayment, locale)}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-on-dark/10 pt-4 text-xs">
        <div>
          <dt className="text-on-dark/60">{t('loanAmount')}</dt>
          <dd className="mt-1 font-semibold tabular-nums">
            {formatMortgageAmount(estimate.loanAmount, locale)}
          </dd>
        </div>
        <div>
          <dt className="text-on-dark/60">{t('totalInterest')}</dt>
          <dd className="mt-1 font-semibold tabular-nums">
            {formatMortgageAmount(estimate.totalInterest, locale)}
          </dd>
        </div>
      </dl>
    </div>
  );
};

const StatusCard = ({ message }: { message: string }) => (
  <div className={cn('rounded-[20px] bg-brand-deep/90 p-6 text-sm text-on-dark/80')}>{message}</div>
);
