/**
 * Picks the nearest allowed loan term when the current term is invalid for an offer.
 */
export const pickNearestLoanTerm = (
  currentTermYears: number,
  termOptionsYears: number[],
): number => {
  if (termOptionsYears.length === 0) {
    return currentTermYears;
  }

  if (termOptionsYears.includes(currentTermYears)) {
    return currentTermYears;
  }

  return termOptionsYears.reduce((best, option) =>
    Math.abs(option - currentTermYears) < Math.abs(best - currentTermYears)
      ? option
      : best,
  );
};
