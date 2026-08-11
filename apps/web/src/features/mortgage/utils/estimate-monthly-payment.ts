const MONTHS_PER_YEAR = 12;
const PERCENT_DIVISOR = 100;

const roundAmd = (value: number): number => Math.round(value);

export type MortgagePaymentEstimate = {
  monthlyPayment: number;
  loanAmount: number;
  downPaymentAmount: number;
  totalPayment: number;
  totalInterest: number;
};

type EstimateParams = {
  propertyPrice: number;
  downPaymentPercent: number;
  annualRatePercent: number;
  loanTermYears: number;
};

const isValidEstimateInput = (params: EstimateParams): boolean => {
  const { propertyPrice, downPaymentPercent, annualRatePercent, loanTermYears } = params;
  return (
    Number.isFinite(propertyPrice) &&
    propertyPrice > 0 &&
    Number.isFinite(downPaymentPercent) &&
    downPaymentPercent >= 0 &&
    downPaymentPercent < PERCENT_DIVISOR &&
    Number.isFinite(annualRatePercent) &&
    annualRatePercent >= 0 &&
    Number.isFinite(loanTermYears) &&
    loanTermYears > 0
  );
};

/**
 * Client-side annuity estimate (mirrors Nest `calculateMortgagePayment` totals).
 */
export const estimateMortgagePayment = (
  params: EstimateParams,
): MortgagePaymentEstimate | null => {
  if (!isValidEstimateInput(params)) {
    return null;
  }

  const price = roundAmd(params.propertyPrice);
  const downPaymentAmount = roundAmd(
    (price * params.downPaymentPercent) / PERCENT_DIVISOR,
  );
  const loanAmount = price - downPaymentAmount;
  if (loanAmount <= 0) {
    return null;
  }

  const numberOfPayments = params.loanTermYears * MONTHS_PER_YEAR;
  let monthlyPayment: number;
  let totalPayment: number;
  let totalInterest: number;

  if (params.annualRatePercent === 0) {
    monthlyPayment = roundAmd(loanAmount / numberOfPayments);
    totalPayment = loanAmount;
    totalInterest = 0;
  } else {
    const monthlyRate =
      params.annualRatePercent / PERCENT_DIVISOR / MONTHS_PER_YEAR;
    const factor = (1 + monthlyRate) ** numberOfPayments;
    const rawMonthly = (loanAmount * monthlyRate * factor) / (factor - 1);
    monthlyPayment = roundAmd(rawMonthly);
    totalPayment = roundAmd(rawMonthly * numberOfPayments);
    totalInterest = Math.max(0, totalPayment - loanAmount);
  }

  return {
    monthlyPayment,
    loanAmount,
    downPaymentAmount,
    totalPayment,
    totalInterest,
  };
};

/**
 * Monthly-only helper for offer cards.
 */
export const estimateMonthlyPayment = (params: EstimateParams): number | null =>
  estimateMortgagePayment(params)?.monthlyPayment ?? null;
