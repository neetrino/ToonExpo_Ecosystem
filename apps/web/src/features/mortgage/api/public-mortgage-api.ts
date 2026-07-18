import type {
  MortgageCalculatorInput,
  MortgageCalculatorResult,
  PublicMortgageOfferListResponse,
} from "@toonexpo/contracts";

import { apiFetch } from "@/shared/api/client";
import { mortgageFetch } from "@/shared/api/public-fetch";

const jsonCredentials = {
  credentials: "include" as const,
  headers: { "Content-Type": "application/json" },
};

export const listPublicMortgageOffers = (): Promise<PublicMortgageOfferListResponse> =>
  apiFetch<PublicMortgageOfferListResponse>({
    path: "/mortgage/offers",
    ...mortgageFetch(),
  });

export const calculateMortgage = (
  body: MortgageCalculatorInput,
): Promise<MortgageCalculatorResult> =>
  apiFetch<MortgageCalculatorResult>({
    path: "/mortgage/calculate",
    method: "POST",
    ...jsonCredentials,
    body: JSON.stringify(body),
  });
