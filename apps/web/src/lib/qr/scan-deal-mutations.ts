import type { BuilderQrScanDealInput } from '@toonexpo/contracts';

import { serverApiRequest } from '@/lib/api/server';

import type { QrScanDealMutationResult } from './mutation-result';

export type CreateScanDealParams = BuilderQrScanDealInput & {
  builderUserId: string;
  companyId: string;
};

export function createDealFromQrScan(
  raw: CreateScanDealParams,
): Promise<QrScanDealMutationResult> {
  return serverApiRequest<QrScanDealMutationResult>('/qr/builder/deals', {
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
  return serverApiRequest<void>(
    `/qr/${encodeURIComponent(params.qrCodeId)}/builder-scan`,
    { method: 'POST', body: { companyId: params.companyId } },
  );
}
