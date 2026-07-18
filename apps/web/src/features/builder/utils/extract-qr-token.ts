/** Matches locale-prefixed or bare buyer QR paths. */
const QR_PATH_PATTERN = /(?:^|\/)(?:[a-z]{2}\/)?qr\/([A-Za-z0-9_-]+)\/?(?:[?#]|$)/i;

/**
 * Extracts a buyer QR token from a raw token, path, or full ToonExpo URL.
 * Returns null when the value is not a recognizable ToonExpo QR payload.
 */
export const extractQrToken = (raw: string): string | null => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  if (/^[A-Za-z0-9_-]+$/.test(trimmed) && !trimmed.includes("/")) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const fromPath = url.pathname.match(QR_PATH_PATTERN);
    if (fromPath?.[1]) {
      return fromPath[1];
    }
  } catch {
    // Not an absolute URL — try path-only matching below.
  }

  const pathMatch = trimmed.match(QR_PATH_PATTERN);
  return pathMatch?.[1] ?? null;
};

/**
 * True when the scanned string looks like a non-ToonExpo QR payload.
 */
export const isNonToonexpoQrPayload = (raw: string): boolean => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return false;
  }
  if (extractQrToken(trimmed)) {
    return false;
  }
  return trimmed.includes("://") || trimmed.includes("/");
};
