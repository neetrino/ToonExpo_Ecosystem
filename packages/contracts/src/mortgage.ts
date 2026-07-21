/**
 * Mortgage / Bank Offers contracts (admin, portal, public).
 */

import type { PublicationStatus } from './catalog.js';

export type BankOfferListItem = {
  id: string;
  partnerCompanyId: string;
  partnerCompanyName?: string;
  title: string;
  shortDescription: string | null;
  rate: string;
  apr: string | null;
  minDownPaymentPercent: string;
  termOptionsYears: number[];
  fees: string | null;
  calculationNotes: string | null;
  featured: boolean;
  sortOrder: number;
  publicationStatus: PublicationStatus;
  createdByUserId: string;
  updatedByUserId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BankOfferListResponse = {
  data: BankOfferListItem[];
};

export type CreateBankOfferBody = {
  partnerCompanyId: string;
  title: string;
  shortDescription?: string;
  rate: number;
  apr?: number;
  minDownPaymentPercent: number;
  termOptionsYears: number[];
  fees?: string;
  calculationNotes?: string;
  featured?: boolean;
  sortOrder?: number;
  publicationStatus?: PublicationStatus;
};

export type UpdateBankOfferBody = {
  title?: string;
  shortDescription?: string | null;
  rate?: number;
  apr?: number | null;
  minDownPaymentPercent?: number;
  termOptionsYears?: number[];
  fees?: string | null;
  calculationNotes?: string | null;
  featured?: boolean;
  sortOrder?: number;
  publicationStatus?: PublicationStatus;
};

export type PortalCreateBankOfferBody = Omit<
  CreateBankOfferBody,
  'partnerCompanyId' | 'publicationStatus'
>;

export type PortalUpdateBankOfferBody = Omit<UpdateBankOfferBody, 'publicationStatus'>;

export type PublicMortgageBankSummary = {
  id: string;
  name: string;
  slug: string;
  logoMediaId: string | null;
  logoUrl: string | null;
};

export type PublicMortgageOfferItem = {
  id: string;
  title: string;
  shortDescription: string | null;
  rate: string;
  apr: string | null;
  minDownPaymentPercent: string;
  termOptionsYears: number[];
  fees: string | null;
  calculationNotes: string | null;
  featured: boolean;
  sortOrder: number;
  bank: PublicMortgageBankSummary;
};

export type PublicMortgageOfferListResponse = {
  data: PublicMortgageOfferItem[];
};

export type MortgageCalculatorInput = {
  propertyPrice: number;
  downPaymentPercent?: number;
  downPaymentAmount?: number;
  loanTermYears: number;
  bankOfferId: string;
};

export type MortgageCalculatorOfferSummary = {
  id: string;
  title: string;
  rate: string;
  apr: string | null;
  minDownPaymentPercent: string;
  termOptionsYears: number[];
  bankName: string;
};

export type MortgageCalculatorResult = {
  monthlyPayment: number;
  loanAmount: number;
  downPaymentAmount: number;
  downPaymentPercent: string;
  totalPayment: number;
  totalInterest: number;
  offer: MortgageCalculatorOfferSummary;
};
