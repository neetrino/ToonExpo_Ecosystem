import {
  BANK_OFFER_MAX_TERM_MONTHS_MAX,
  BANK_OFFER_MAX_TERM_MONTHS_MIN,
} from '@toonexpo/contracts';

export const MONTHS_PER_YEAR = 12;
export const PERCENT_DIVISOR = 100;

export type MortgageCalcInput = {
  propertyPriceAmd: number;
  downPaymentAmd: number;
  termMonths: number;
  annualInterestRatePercent: number;
};

export type MortgageCalcResult = {
  loanAmountAmd: number;
  monthlyPaymentAmd: number;
  totalPaymentAmd: number;
  overpaymentAmd: number;
};

function roundAmd(value: number): number {
  return Math.round(value);
}

function isValidTermMonths(termMonths: number): boolean {
  return (
    Number.isFinite(termMonths) &&
    termMonths >= BANK_OFFER_MAX_TERM_MONTHS_MIN &&
    termMonths <= BANK_OFFER_MAX_TERM_MONTHS_MAX
  );
}

/** Computes annuity mortgage payment from property price, down payment, term, and annual rate. */
export function calculateMortgagePayment(input: MortgageCalcInput): MortgageCalcResult {
  const propertyPriceAmd = Math.max(0, input.propertyPriceAmd);
  const downPaymentAmd = Math.max(0, Math.min(input.downPaymentAmd, propertyPriceAmd));
  const loanAmountAmd = roundAmd(propertyPriceAmd - downPaymentAmd);

  if (loanAmountAmd <= 0 || !isValidTermMonths(input.termMonths)) {
    return {
      loanAmountAmd: 0,
      monthlyPaymentAmd: 0,
      totalPaymentAmd: 0,
      overpaymentAmd: 0,
    };
  }

  const termMonths = Math.round(input.termMonths);
  const annualRate = Math.max(0, input.annualInterestRatePercent);

  if (annualRate === 0) {
    const monthlyPaymentAmd = roundAmd(loanAmountAmd / termMonths);
    const totalPaymentAmd = roundAmd(monthlyPaymentAmd * termMonths);
    return {
      loanAmountAmd,
      monthlyPaymentAmd,
      totalPaymentAmd,
      overpaymentAmd: 0,
    };
  }

  const monthlyRate = annualRate / PERCENT_DIVISOR / MONTHS_PER_YEAR;
  const compoundFactor = (1 + monthlyRate) ** termMonths;
  const monthlyPaymentAmd = roundAmd(
    (loanAmountAmd * monthlyRate * compoundFactor) / (compoundFactor - 1),
  );
  const totalPaymentAmd = roundAmd(monthlyPaymentAmd * termMonths);

  return {
    loanAmountAmd,
    monthlyPaymentAmd,
    totalPaymentAmd,
    overpaymentAmd: roundAmd(totalPaymentAmd - loanAmountAmd),
  };
}
