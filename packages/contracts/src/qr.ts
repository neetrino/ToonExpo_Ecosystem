/**
 * Buyer permanent QR status.
 */
export type QrCodeStatus = "active" | "inactive" | "blocked";

/**
 * Scan/resolve context recorded on QrScanEvent.
 */
export type QrScanContext =
  | "builder_scan"
  | "entrance_checkin"
  | "buyer_self_view"
  | "unknown";

/**
 * Resolve outcome recorded on QrScanEvent.
 */
export type QrScanResultStatus =
  | "resolved"
  | "invalid"
  | "blocked"
  | "unauthorized"
  | "error";

/**
 * Payload kind returned by POST /qr/resolve.
 */
export type QrResolveKind =
  | "buyer_action"
  | "entrance_checkin"
  | "owner_profile"
  | "denied";

/**
 * GET /buyer/qr — data for the frontend to render the QR image.
 */
export type BuyerQrResponse = {
  qrCodeId: string;
  status: QrCodeStatus;
  /** Camera-scannable URL: `{APP_URL}/qr/{token}`. */
  payloadUrl: string;
  createdAt: string;
};

/**
 * POST /qr/resolve request body. Accepts raw token or full payload URL.
 */
export type ResolveQrRequest = {
  token: string;
};

/**
 * Shared buyer identity fields for privileged resolve payloads.
 */
export type QrBuyerIdentity = {
  buyerId: string;
  buyerProfileId: string;
  name: string;
};

/**
 * Builder company_member resolve payload (CRM action screen).
 * Contacts follow privacy docs (full phone/email for authorized builders).
 */
export type QrBuyerActionPayload = QrBuyerIdentity & {
  kind: "buyer_action";
  phone: string;
  email: string;
  scanEventId: string;
  scannerCompanyId: string;
};

/**
 * Entrance staff resolve payload (check-in module consumes later).
 */
export type QrEntranceCheckinPayload = QrBuyerIdentity & {
  kind: "entrance_checkin";
  scanEventId: string;
  /** Already-resolved QR row id — avoids a second lookup on check-in. */
  qrCodeId: string;
};

/**
 * Buyer scanning their own QR.
 */
export type QrOwnerProfilePayload = QrBuyerIdentity & {
  kind: "owner_profile";
  phone: string;
  email: string;
  scanEventId: string;
  payloadUrl: string;
};

export type QrResolveResponse =
  | QrBuyerActionPayload
  | QrEntranceCheckinPayload
  | QrOwnerProfilePayload;

/**
 * Buyer-facing scan history row (no employee personal identity).
 */
export type BuyerQrScanHistoryItem = {
  id: string;
  scanContext: QrScanContext;
  resultStatus: QrScanResultStatus;
  createdAt: string;
  /** Builder company name when context is builder_scan; otherwise null. */
  scannerCompanyName: string | null;
};

export type BuyerQrScanHistoryResponse = {
  data: BuyerQrScanHistoryItem[];
};

/**
 * Portal Project QR — public project page URL for exhibition printouts.
 */
export type ProjectQrResponse = {
  projectId: string;
  slug: string;
  /** Public page URL: `{APP_URL}/{locale}/projects/{projectId}`. */
  payloadUrl: string;
};
