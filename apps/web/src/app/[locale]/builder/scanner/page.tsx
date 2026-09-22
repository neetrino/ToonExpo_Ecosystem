import { getLocale, setRequestLocale } from 'next-intl/server';

import { ScannerPage } from '@/features/builder/components/scanner-page';

type BuilderScannerPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Exhibition QR scanner for builder staff (mobile-first).
 */
export default async function BuilderScannerPage({ params }: BuilderScannerPageProps) {
  await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  return <ScannerPage />;
}
