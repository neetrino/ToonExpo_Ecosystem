/**
 * Home hero payment methods. Append ids here when the full list arrives.
 * `income_tax_refund` is the only confirmed option so far.
 */
export const HOME_PAYMENT_METHODS = [{ id: 'income_tax_refund' }] as const;

export type HomePaymentMethodId = (typeof HOME_PAYMENT_METHODS)[number]['id'];

export const isHomePaymentMethodId = (value: string): value is HomePaymentMethodId =>
  HOME_PAYMENT_METHODS.some((method) => method.id === value);

/** Hero price inputs are millions of AMD; catalog prices are whole drams. */
export const HOME_PRICE_MILLION_AMD = 1_000_000;
