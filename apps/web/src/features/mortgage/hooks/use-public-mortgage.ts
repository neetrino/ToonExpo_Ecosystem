"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { MortgageCalculatorInput } from "@toonexpo/contracts";

import {
  calculateMortgage,
  listPublicMortgageOffers,
} from "@/features/mortgage/api/public-mortgage-api";
import { PUBLIC_MORTGAGE_OFFERS_QUERY_KEY } from "@/features/mortgage/constants";

export const usePublicMortgageOffersQuery = () =>
  useQuery({
    queryKey: PUBLIC_MORTGAGE_OFFERS_QUERY_KEY,
    queryFn: listPublicMortgageOffers,
  });

export const useMortgageCalculateMutation = () =>
  useMutation({
    mutationFn: (body: MortgageCalculatorInput) => calculateMortgage(body),
  });
