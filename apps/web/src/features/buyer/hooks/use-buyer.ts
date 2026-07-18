"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateBuyerRequestBody, CreateDealFromScanBody } from "@toonexpo/contracts";

import { getBuyerQr, getBuyerQrScans } from "@/features/buyer/api/buyer-qr-api";
import {
  createBuyerRequest,
  createDealFromScan,
  listBuyerRequests,
} from "@/features/buyer/api/buyer-requests-api";
import { resolveQrToken } from "@/features/buyer/api/qr-resolve-api";
import {
  BUYER_QR_QUERY_KEY,
  BUYER_QR_SCANS_QUERY_KEY,
  BUYER_REQUESTS_PAGE_SIZE,
  BUYER_REQUESTS_QUERY_KEY,
} from "@/features/buyer/constants";

/**
 * Permanent buyer QR payload.
 */
export const useBuyerQrQuery = (enabled = true) =>
  useQuery({
    queryKey: BUYER_QR_QUERY_KEY,
    queryFn: () => getBuyerQr(),
    enabled,
  });

/**
 * Buyer QR scan history.
 */
export const useBuyerQrScansQuery = (enabled = true) =>
  useQuery({
    queryKey: BUYER_QR_SCANS_QUERY_KEY,
    queryFn: () => getBuyerQrScans(),
    enabled,
  });

/**
 * Paginated buyer request history.
 */
export const useBuyerRequestsQuery = (page = 1, enabled = true) =>
  useQuery({
    queryKey: [...BUYER_REQUESTS_QUERY_KEY, { page }],
    queryFn: () => listBuyerRequests(page, BUYER_REQUESTS_PAGE_SIZE),
    enabled,
  });

/**
 * Create a catalog interest request.
 */
export const useCreateBuyerRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateBuyerRequestBody) => createBuyerRequest(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BUYER_REQUESTS_QUERY_KEY });
    },
  });
};

/**
 * Resolve a scanned QR token (optional session).
 */
export const useResolveQrMutation = () =>
  useMutation({
    mutationFn: (token: string) => resolveQrToken({ token }),
  });

/**
 * Create CRM deal from a builder QR scan event.
 */
export const useCreateDealFromScanMutation = () =>
  useMutation({
    mutationFn: (body: CreateDealFromScanBody) => createDealFromScan(body),
  });
