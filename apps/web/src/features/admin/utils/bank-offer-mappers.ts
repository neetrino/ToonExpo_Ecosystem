import type {
  BankOfferListItem,
  CreateBankOfferBody,
  UpdateBankOfferBody,
} from "@toonexpo/contracts";

import type {
  BankOfferFormInput,
  BankOfferFormValues,
} from "@/features/admin/schemas/bank-offer.schema";

export const toCreateBankOfferBody = (
  values: BankOfferFormValues,
): CreateBankOfferBody => {
  const body: CreateBankOfferBody = {
    partnerCompanyId: values.partnerCompanyId,
    title: values.title,
    rate: values.rate,
    minDownPaymentPercent: values.minDownPaymentPercent,
    termOptionsYears: values.termOptionsYears,
    featured: values.featured,
    sortOrder: values.sortOrder,
    publicationStatus: values.publicationStatus,
  };

  if (values.shortDescription && values.shortDescription.length > 0) {
    body.shortDescription = values.shortDescription;
  }
  if (values.apr != null) {
    body.apr = values.apr;
  }
  if (values.fees && values.fees.length > 0) {
    body.fees = values.fees;
  }
  if (values.calculationNotes && values.calculationNotes.length > 0) {
    body.calculationNotes = values.calculationNotes;
  }

  return body;
};

export const toUpdateBankOfferBody = (
  values: Omit<BankOfferFormValues, "partnerCompanyId">,
): UpdateBankOfferBody => ({
  title: values.title,
  rate: values.rate,
  minDownPaymentPercent: values.minDownPaymentPercent,
  termOptionsYears: values.termOptionsYears,
  featured: values.featured,
  sortOrder: values.sortOrder,
  publicationStatus: values.publicationStatus,
  shortDescription: values.shortDescription?.length ? values.shortDescription : null,
  apr: values.apr ?? null,
  fees: values.fees?.length ? values.fees : null,
  calculationNotes: values.calculationNotes?.length
    ? values.calculationNotes
    : null,
});

export const toBankOfferFormValues = (
  offer: BankOfferListItem,
): BankOfferFormInput => ({
  partnerCompanyId: offer.partnerCompanyId,
  title: offer.title,
  shortDescription: offer.shortDescription ?? "",
  rate: Number(offer.rate),
  apr: offer.apr != null ? Number(offer.apr) : undefined,
  minDownPaymentPercent: Number(offer.minDownPaymentPercent),
  termOptionsYears: offer.termOptionsYears.join(", "),
  fees: offer.fees ?? "",
  calculationNotes: offer.calculationNotes ?? "",
  featured: offer.featured,
  sortOrder: offer.sortOrder,
  publicationStatus: offer.publicationStatus,
});
