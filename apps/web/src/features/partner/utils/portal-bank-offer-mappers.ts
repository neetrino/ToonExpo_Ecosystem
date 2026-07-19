import type {
  PortalCreateBankOfferBody,
  PortalUpdateBankOfferBody,
} from "@toonexpo/contracts";

import type { PortalBankOfferFormValues } from "@/features/admin/schemas/bank-offer.schema";

export const toPortalCreateBankOfferBody = (
  values: PortalBankOfferFormValues,
): PortalCreateBankOfferBody => {
  const body: PortalCreateBankOfferBody = {
    title: values.title,
    rate: values.rate,
    minDownPaymentPercent: values.minDownPaymentPercent,
    termOptionsYears: values.termOptionsYears,
    featured: values.featured,
    sortOrder: values.sortOrder,
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

export const toPortalUpdateBankOfferBody = (
  values: PortalBankOfferFormValues,
): PortalUpdateBankOfferBody => ({
  title: values.title,
  rate: values.rate,
  minDownPaymentPercent: values.minDownPaymentPercent,
  termOptionsYears: values.termOptionsYears,
  featured: values.featured,
  sortOrder: values.sortOrder,
  shortDescription: values.shortDescription?.length ? values.shortDescription : null,
  apr: values.apr ?? null,
  fees: values.fees?.length ? values.fees : null,
  calculationNotes: values.calculationNotes?.length
    ? values.calculationNotes
    : null,
});
