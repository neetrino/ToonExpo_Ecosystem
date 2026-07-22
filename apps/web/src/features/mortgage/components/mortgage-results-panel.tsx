'use client';

import type { MortgageCalculatorResult } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';

import { formatMortgageAmount } from '@/features/mortgage/utils/format-mortgage-amount';
import { cn } from '@/shared/ui/cn';

type MortgageResultsPanelProps = {
  result: MortgageCalculatorResult | null;
  bankName: string;
  isCalculating: boolean;
  hasValidationError: boolean;
};

/**
 * Dark summary card inside “Your loan” — Figma `105:2589`.
 */
export const MortgageResultsPanel = ({
  result,
  bankName,
  isCalculating,
  hasValidationError,
}: MortgageResultsPanelProps) => {
  const t = useTranslations('Mortgage.calculator');
  const locale = useLocale();

  if (hasValidationError) {
    return <StatusCard message={t('fixInputs')} />;
  }

  if (isCalculating) {
    return <StatusCard message={t('calculating')} />;
  }

  if (!result) {
    return <StatusCard message={t('enterInputs')} />;
  }

  return (
    <div className="rounded-[20px] bg-brand-deep p-6 text-on-dark">
      <p className="text-[10px] font-bold tracking-widest text-on-dark/60 uppercase">
        {t('monthlyPaymentWithBank', { bank: bankName })}
      </p>
      <p className="mt-2 font-brand text-4xl font-bold leading-10 tracking-tight">
        {formatMortgageAmount(result.monthlyPayment, locale)}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-on-dark/10 pt-4 text-xs">
        <div>
          <dt className="text-on-dark/60">{t('loanAmount')}</dt>
          <dd className="mt-1 font-semibold">{formatMortgageAmount(result.loanAmount, locale)}</dd>
        </div>
        <div>
          <dt className="text-on-dark/60">{t('totalInterest')}</dt>
          <dd className="mt-1 font-semibold">
            {formatMortgageAmount(result.totalInterest, locale)}
          </dd>
        </div>
      </dl>
    </div>
  );
};

const StatusCard = ({ message }: { message: string }) => (
  <div className={cn('rounded-[20px] bg-brand-deep/90 p-6 text-sm text-on-dark/80')}>{message}</div>
);
