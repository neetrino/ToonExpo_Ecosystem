import { setRequestLocale } from "next-intl/server";

import { ScannerPage } from "@/features/builder/components/scanner-page";

type BuilderScannerPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Exhibition QR scanner for builder staff (mobile-first).
 */
export default async function BuilderScannerPage({
  params,
}: BuilderScannerPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ScannerPage />;
}
