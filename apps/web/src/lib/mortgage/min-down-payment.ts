import { PERCENT_DIVISOR } from './calc';

export type DownPaymentValidation = {
  effectiveDownPaymentAmd: number;
  isBelowMinimum: boolean;
  minimumDownPaymentAmd: number;
};

/** Minimum down payment in AMD from property price and offer percent. */
export function getMinimumDownPaymentAmd(
  propertyPriceAmd: number,
  minDownPaymentPercent: number,
): number {
  const price = Math.max(0, propertyPriceAmd);
  const percent = Math.max(0, minDownPaymentPercent);
  return Math.round((price * percent) / PERCENT_DIVISOR);
}

/**
 * Clamps down payment to the offer minimum for calculations while flagging
 * when the buyer-entered amount is below the required minimum.
 */
export function resolveDownPaymentForOffer(input: {
  propertyPriceAmd: number;
  downPaymentAmd: number;
  minDownPaymentPercent: number | null | undefined;
}): DownPaymentValidation {
  const propertyPriceAmd = Math.max(0, input.propertyPriceAmd);
  const downPaymentAmd = Math.max(0, Math.min(input.downPaymentAmd, propertyPriceAmd));
  const minimumDownPaymentAmd = getMinimumDownPaymentAmd(
    propertyPriceAmd,
    input.minDownPaymentPercent ?? 0,
  );
  const isBelowMinimum = downPaymentAmd < minimumDownPaymentAmd;

  return {
    effectiveDownPaymentAmd: isBelowMinimum ? minimumDownPaymentAmd : downPaymentAmd,
    isBelowMinimum,
    minimumDownPaymentAmd,
  };
}
