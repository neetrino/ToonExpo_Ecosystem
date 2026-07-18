import { BadRequestException } from "@nestjs/common";
import type { Prisma } from "@toonexpo/db";
import { describe, expect, it } from "vitest";

import { calculateMortgagePayment } from "./mortgage-calculator.util.js";

const decimal = (value: string): Prisma.Decimal =>
  ({ toString: () => value }) as unknown as Prisma.Decimal;

const baseOffer = {
  id: "offer_1",
  title: "Standard Mortgage",
  rate: decimal("12.5"),
  apr: decimal("13.1"),
  minDownPaymentPercent: decimal("10"),
  termOptionsYears: [15, 20, 30],
  partnerCompany: { name: "Example Bank" },
};

describe("calculateMortgagePayment", () => {
  it("calculates annuity payment with percent down payment", () => {
    const result = calculateMortgagePayment(
      {
        propertyPrice: 50_000_000,
        downPaymentPercent: 20,
        loanTermYears: 20,
        bankOfferId: baseOffer.id,
      },
      baseOffer,
    );

    expect(result.downPaymentAmount).toBe(10_000_000);
    expect(result.loanAmount).toBe(40_000_000);
    expect(result.monthlyPayment).toBeGreaterThan(0);
    expect(result.totalPayment).toBe(result.monthlyPayment * 20 * 12);
    expect(result.totalInterest).toBe(result.totalPayment - result.loanAmount);
    expect(result.offer.bankName).toBe("Example Bank");
  });

  it("uses zero-rate fallback when annual rate is zero", () => {
    const result = calculateMortgagePayment(
      {
        propertyPrice: 12_000_000,
        downPaymentAmount: 2_000_000,
        loanTermYears: 15,
        bankOfferId: baseOffer.id,
      },
      {
        ...baseOffer,
        rate: decimal("0"),
      },
    );

    expect(result.loanAmount).toBe(10_000_000);
    expect(result.monthlyPayment).toBe(Math.round(10_000_000 / 180));
    expect(result.totalPayment).toBe(result.monthlyPayment * 15 * 12);
    expect(result.totalInterest).toBe(result.totalPayment - result.loanAmount);
  });

  it("accepts down payment exactly at offer minimum", () => {
    const result = calculateMortgagePayment(
      {
        propertyPrice: 10_000_000,
        downPaymentPercent: 10,
        loanTermYears: 15,
        bankOfferId: baseOffer.id,
      },
      baseOffer,
    );

    expect(result.downPaymentAmount).toBe(1_000_000);
    expect(result.loanAmount).toBe(9_000_000);
  });

  it("rejects down payment below offer minimum", () => {
    expect(() =>
      calculateMortgagePayment(
        {
          propertyPrice: 10_000_000,
          downPaymentPercent: 9.99,
          loanTermYears: 15,
          bankOfferId: baseOffer.id,
        },
        baseOffer,
      ),
    ).toThrow(BadRequestException);
  });

  it("rejects unsupported loan term", () => {
    expect(() =>
      calculateMortgagePayment(
        {
          propertyPrice: 10_000_000,
          downPaymentPercent: 20,
          loanTermYears: 25,
          bankOfferId: baseOffer.id,
        },
        baseOffer,
      ),
    ).toThrow(BadRequestException);
  });

  it("rejects non-positive property price", () => {
    expect(() =>
      calculateMortgagePayment(
        {
          propertyPrice: 0,
          downPaymentPercent: 20,
          loanTermYears: 20,
          bankOfferId: baseOffer.id,
        },
        baseOffer,
      ),
    ).toThrow(BadRequestException);
  });

  it("rejects providing both down payment percent and amount", () => {
    expect(() =>
      calculateMortgagePayment(
        {
          propertyPrice: 10_000_000,
          downPaymentPercent: 20,
          downPaymentAmount: 2_000_000,
          loanTermYears: 20,
          bankOfferId: baseOffer.id,
        },
        baseOffer,
      ),
    ).toThrow(BadRequestException);
  });
});
