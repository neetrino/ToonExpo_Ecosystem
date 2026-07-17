import { apiRequest } from '@/lib/api/client';

import type { QrEnsureResult } from './mutation-result';

/** Ensures the signed-in buyer has an active QR. */
export function ensureBuyerQr(_userId: string): Promise<QrEnsureResult> {
  return apiRequest<QrEnsureResult>('/qr/ensure', { method: 'POST' });
}

/** Revokes the signed-in buyer QR. */
export function revokeBuyerQr(_userId: string): Promise<QrEnsureResult> {
  return apiRequest<QrEnsureResult>('/qr/revoke', { method: 'POST' });
}

/** Issues a replacement QR token for the signed-in buyer. */
export function regenerateBuyerQr(_userId: string): Promise<QrEnsureResult> {
  return apiRequest<QrEnsureResult>('/qr/regenerate', { method: 'POST' });
}
