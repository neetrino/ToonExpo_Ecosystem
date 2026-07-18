import { BadRequestException } from "@nestjs/common";
import type {
  MortgageCalculatorInput,
  MortgageCalculatorResult,
} from "@toonexpo/contracts";
import type { Prisma } from "@toonexpo/db";

import {
  MORTGAGE_MONTHS_PER_YEAR,
  MORTGAGE_PERCENT_DIVISOR,
} from "../mortgage.constants.js";
import {
  decimalToOptionalString,
  decimalToRequiredString,
} from "../mappers/bank-offer.mapper.js";

type CalculatorOffer = Prisma.BankOfferGetPayload<{
  include: {
    partnerCompany: { select: { name: true } };
  };
}>;

export type MortgageCalculatorValidationError = {
  field: string;
  message: string;
};

const roundAmd = (value: number): number => Math.round(value);

const parseDecimalNumber = (value: Prisma.Decimal): number => Number(value.toString());

const resolveDownPayment = (
  propertyPrice: number,
  input: MortgageCalculatorInput,
): { downPaymentAmount: number; downPaymentPercent: number } => {
  if (input.downPaymentAmount != null && input.downPaymentPercent != null) {
    throw new BadRequestException(
      "Provide either downPaymentPercent or downPaymentAmount, not both",
    );
  }

  if (input.downPaymentAmount != null) {
    const downPaymentAmount = roundAmd(input.downPaymentAmount);
    const downPaymentPercent =
      (downPaymentAmount * MORTGAGE_PERCENT_DIVISOR) / propertyPrice;
    return { downPaymentAmount, downPaymentPercent };
  }

  const percent = input.downPaymentPercent ?? 0;
  const downPaymentAmount = roundAmd(
    (propertyPrice * percent) / MORTGAGE_PERCENT_DIVISOR,
  );
  return { downPaymentAmount, downPaymentPercent: percent };
};

type PaymentTotals = {
  /** Rounded AMD value for display. */
  monthlyPayment: number;
  /** Rounded once from the unrounded schedule, so totals stay exact. */
  totalPayment: number;
  totalInterest: number;
};

const calculatePaymentTotals = (
  loanAmount: number,
  annualRatePercent: number,
  loanTermYears: number,
): PaymentTotals => {
  const numberOfPayments = loanTermYears * MORTGAGE_MONTHS_PER_YEAR;

  if (annualRatePercent === 0) {
    // A 0% loan repays exactly the principal: no rounding residual in totals.
    return {
      monthlyPayment: roundAmd(loanAmount / numberOfPayments),
      totalPayment: loanAmount,
      totalInterest: 0,
    };
  }

  const monthlyRate =
    annualRatePercent / MORTGAGE_PERCENT_DIVISOR / MORTGAGE_MONTHS_PER_YEAR;
  const factor = (1 + monthlyRate) ** numberOfPayments;
  const rawMonthlyPayment = (loanAmount * monthlyRate * factor) / (factor - 1);

  const totalPayment = roundAmd(rawMonthlyPayment * numberOfPayments);
  const totalInterest = Math.max(0, totalPayment - loanAmount);

  return {
    monthlyPayment: roundAmd(rawMonthlyPayment),
    totalPayment,
    totalInterest,
  };
};

export const calculateMortgagePayment = (
  input: MortgageCalculatorInput,
  offer: CalculatorOffer,
): MortgageCalculatorResult => {
  if (input.propertyPrice <= 0) {
    throw new BadRequestException("propertyPrice must be positive");
  }

  const propertyPrice = roundAmd(input.propertyPrice);
  const rate = parseDecimalNumber(offer.rate);
  const minDownPaymentPercent = parseDecimalNumber(offer.minDownPaymentPercent);

  const { downPaymentAmount, downPaymentPercent } = resolveDownPayment(
    propertyPrice,
    input,
  );

  if (downPaymentPercent + 1e-9 < minDownPaymentPercent) {
    throw new BadRequestException(
      "Down payment is below the selected offer minimum",
    );
  }

  if (!offer.termOptionsYears.includes(input.loanTermYears)) {
    throw new BadRequestException(
      "Loan term is not supported by the selected offer",
    );
  }

  const loanAmount = propertyPrice - downPaymentAmount;
  if (loanAmount <= 0) {
    throw new BadRequestException("Loan amount must be positive");
  }

  const { monthlyPayment, totalPayment, totalInterest } =
    calculatePaymentTotals(loanAmount, rate, input.loanTermYears);

  return {
    monthlyPayment,
    loanAmount,
    downPaymentAmount,
    downPaymentPercent: downPaymentPercent.toFixed(2),
    totalPayment,
    totalInterest,
    offer: {
      id: offer.id,
      title: offer.title,
      rate: decimalToRequiredString(offer.rate),
      apr: decimalToOptionalString(offer.apr),
      minDownPaymentPercent: decimalToRequiredString(offer.minDownPaymentPercent),
      termOptionsYears: offer.termOptionsYears,
      bankName: offer.partnerCompany.name,
    },
  };
};
