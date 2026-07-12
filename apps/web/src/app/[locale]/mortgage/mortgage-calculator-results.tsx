import { formatPriceAmd } from '@/lib/catalog/format-price';
import type { MortgageCalcResult } from '@/lib/mortgage/calc';

type MortgageResultsLabels = {
  monthlyPayment: string;
  loanAmount: string;
  totalPayment: string;
  overpayment: string;
};

type MortgageCalculatorResultsProps = {
  result: MortgageCalcResult;
  locale: string;
  labels: MortgageResultsLabels;
  disclaimer: string;
};

export function MortgageCalculatorResults({
  result,
  locale,
  labels,
  disclaimer,
}: MortgageCalculatorResultsProps) {
  return (
    <>
      <dl className="catalog-mortgage__results">
        <div>
          <dt>{labels.monthlyPayment}</dt>
          <dd className="catalog-mortgage__highlight">
            {formatPriceAmd(result.monthlyPaymentAmd, locale)}
          </dd>
        </div>
        <div>
          <dt>{labels.loanAmount}</dt>
          <dd>{formatPriceAmd(result.loanAmountAmd, locale)}</dd>
        </div>
        <div>
          <dt>{labels.totalPayment}</dt>
          <dd>{formatPriceAmd(result.totalPaymentAmd, locale)}</dd>
        </div>
        <div>
          <dt>{labels.overpayment}</dt>
          <dd>{formatPriceAmd(result.overpaymentAmd, locale)}</dd>
        </div>
      </dl>
      <p className="catalog-mortgage__disclaimer">{disclaimer}</p>
    </>
  );
}
