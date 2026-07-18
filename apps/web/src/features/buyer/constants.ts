/** Matches NestJS CRM_NOTE_MAX_LENGTH for buyer request notes. */
export const BUYER_REQUEST_NOTE_MAX_LENGTH = 4000;

/** TanStack Query keys for buyer area. */
export const BUYER_QR_QUERY_KEY = ["buyer", "qr"] as const;
export const BUYER_QR_SCANS_QUERY_KEY = ["buyer", "qr", "scans"] as const;
export const BUYER_REQUESTS_QUERY_KEY = ["buyer", "requests"] as const;

/** Default page size for buyer request history. */
export const BUYER_REQUESTS_PAGE_SIZE = 20;

/** QR display sizes (px) for phone exhibition use. */
export const QR_DISPLAY_SIZE_PX = 280;
export const QR_FULLSCREEN_SIZE_PX = 320;
