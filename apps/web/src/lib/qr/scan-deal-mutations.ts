import type { BuilderQrScanDealInput } from '@toonexpo/contracts';

import { apiRequest } from '@/lib/api/client';

import type { QrScanDealMutationResult } from './mutation-result';

export type CreateScanDealParams = BuilderQrScanDealInput & {
  builderUserId: string;
  companyId: string;
};

export function createDealFromQrScan(raw: CreateScanDealParams): Promise<QrScanDealMutationResult> {
  return apiRequest<QrScanDealMutationResult>('/qr/builder/deals', {
    method: 'POST',
    body: {
      companyId: raw.companyId,
      qrToken: raw.qrToken,
      projectId: raw.projectId,
      note: raw.note,
    },
  });
}

export function logBuilderQrScan(params: {
  qrCodeId: string;
  scannedByUserId: string;
  companyId: string;
}): Promise<void> {
  return apiRequest<void>(`/qr/${encodeURIComponent(params.qrCodeId)}/builder-scan`, {
    method: 'POST',
    body: { companyId: params.companyId },
  });
}
