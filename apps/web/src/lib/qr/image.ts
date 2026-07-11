import QRCode from 'qrcode';

const QR_ERROR_CORRECTION = 'M' as const;
const QR_SVG_WIDTH = 256;

/** Renders a QR payload as an SVG string (server-side). */
export async function renderQrSvg(payload: string): Promise<string> {
  return QRCode.toString(payload, {
    type: 'svg',
    errorCorrectionLevel: QR_ERROR_CORRECTION,
    width: QR_SVG_WIDTH,
    margin: 1,
  });
}

/** Absolute or relative scan URL for the given opaque token and locale. */
export function buildQrPayloadUrl(token: string, locale: string, appUrl?: string): string {
  const path = `/${locale}/q/${token}`;
  if (!appUrl) {
    return path;
  }
  return new URL(path, appUrl).toString();
}
