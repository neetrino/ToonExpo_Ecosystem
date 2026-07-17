import { setRequestLocale } from 'next-intl/server';

import { QrScanClient } from './qr-scan-client';

type QrScanPageProps = {
  params: Promise<{ locale: string; token: string }>;
};

/**
 * Public QR resolve route — role-branched client load via Nest session cookie.
 */
export default async function QrScanPage({ params }: QrScanPageProps) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  return <QrScanClient token={token} />;
}
