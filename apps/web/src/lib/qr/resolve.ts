import type { PlatformRole } from '@toonexpo/domain';

import { apiRequest } from '@/lib/api/client';

export type BuyerContactSnapshot = {
  userId: string;
  name: string | null;
  email: string;
  phone: string | null;
};
export type EntranceBuyerSnapshot = { userId: string; name: string | null };
export type BuilderProjectOption = { id: string; name: string };
export type QrResolveInvalid = { kind: 'invalid' };
export type QrResolveOwner = { kind: 'owner'; qrCodeId: string };
export type QrResolveBuilder = {
  kind: 'builder';
  qrCodeId: string;
  buyer: BuyerContactSnapshot;
  projects: BuilderProjectOption[];
};
export type QrResolveEntrance = {
  kind: 'entrance';
  qrCodeId: string;
  buyer: EntranceBuyerSnapshot;
};
export type QrResolveLimited = { kind: 'limited'; qrCodeId: string };
export type QrResolveResult =
  QrResolveInvalid | QrResolveOwner | QrResolveBuilder | QrResolveEntrance | QrResolveLimited;

type SessionContext = {
  userId?: string;
  role?: PlatformRole;
  companyId?: string;
};

/** Resolves a QR through Nest; authorization is derived from the API session. */
export function resolveQrScan(token: string, session: SessionContext): Promise<QrResolveResult> {
  const query = session.companyId ? `?companyId=${encodeURIComponent(session.companyId)}` : '';
  return apiRequest<QrResolveResult>(`/qr/resolve/${encodeURIComponent(token)}${query}`);
}

export function toPublicResolveShape(result: QrResolveResult): {
  kind: QrResolveResult['kind'];
  hasBuyerPii: boolean;
  hasContactPii: boolean;
} {
  if (result.kind === 'builder') {
    return { kind: 'builder', hasBuyerPii: true, hasContactPii: true };
  }
  if (result.kind === 'entrance') {
    return { kind: 'entrance', hasBuyerPii: true, hasContactPii: false };
  }
  return { kind: result.kind, hasBuyerPii: false, hasContactPii: false };
}
