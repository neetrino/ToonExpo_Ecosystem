export const resolveMortgageCalculatorValidationMessage = (
  code: string | undefined,
  t: (key: string) => string,
): string | null => {
  if (code === "downPaymentBelowMinimum") {
    return t("validation.downPaymentBelowMinimum");
  }
  if (code === "invalidTerm") {
    return t("validation.invalidTerm");
  }
  return t("validation.invalid");
};
