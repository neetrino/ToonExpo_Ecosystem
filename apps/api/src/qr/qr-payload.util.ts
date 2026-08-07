/**
 * Extracts the opaque QR token from a raw token or full payload URL.
 */
export const extractQrToken = (input: string): string => {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return trimmed;
  }

  try {
    const asUrl = new URL(trimmed);
    const segments = asUrl.pathname.split('/').filter(Boolean);
    const qrIndex = segments.findIndex((segment) => segment === 'qr');
    if (qrIndex >= 0 && segments[qrIndex + 1]) {
      return segments[qrIndex + 1] as string;
    }
  } catch {
    // Not a URL — treat as opaque token.
  }

  const pathMatch = trimmed.match(/(?:^|\/)qr\/([A-Za-z0-9_-]+)/);
  if (pathMatch?.[1]) {
    return pathMatch[1];
  }

  return trimmed;
};

/**
 * Builds the camera-scannable buyer QR payload URL.
 */
export const buildBuyerQrPayloadUrl = (appUrl: string, token: string): string => {
  const base = appUrl.replace(/\/$/, '');
  return `${base}/qr/${token}`;
};

/** Path segment for catalog QR interest landing (notes form → CRM request). */
export const CATALOG_QR_INTEREST_PATH_SEGMENT = 'interest';

/**
 * Builds the project interest landing URL for Project QR printouts.
 */
export const buildProjectQrPayloadUrl = (
  appUrl: string,
  locale: string,
  projectId: string,
): string => {
  const base = appUrl.replace(/\/$/, '');
  return `${base}/${locale}/projects/${projectId}/${CATALOG_QR_INTEREST_PATH_SEGMENT}`;
};

/**
 * Builds the apartment interest landing URL for apartment QR printouts.
 */
export const buildApartmentQrPayloadUrl = (
  appUrl: string,
  locale: string,
  apartmentId: string,
): string => {
  const base = appUrl.replace(/\/$/, '');
  return `${base}/${locale}/apartments/${apartmentId}/${CATALOG_QR_INTEREST_PATH_SEGMENT}`;
};
