"use client";

import { useTranslations } from "next-intl";

import { BuyerQrCode } from "@/features/buyer/components/buyer-qr-code";
import { ScanHistoryList } from "@/features/buyer/components/scan-history-list";
import {
  useBuyerQrQuery,
  useBuyerQrScansQuery,
} from "@/features/buyer/hooks/use-buyer";

type BuyerQrPageContentProps = {
  buyerName: string;
};

/**
 * Client shell for My QR: code + scan history.
 */
export const BuyerQrPageContent = ({ buyerName }: BuyerQrPageContentProps) => {
  const t = useTranslations("Profile.qr");
  const qrQuery = useBuyerQrQuery();
  const scansQuery = useBuyerQrScansQuery();

  if (qrQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">{t("loading")}</p>;
  }

  if (qrQuery.isError || !qrQuery.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t("error")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <BuyerQrCode
        payloadUrl={qrQuery.data.payloadUrl}
        buyerName={buyerName}
      />
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-ink">{t("scans.title")}</h2>
        {scansQuery.isLoading ? (
          <p className="text-sm text-ink-secondary">{t("scans.loading")}</p>
        ) : scansQuery.isError ? (
          <p role="alert" className="text-sm text-danger">
            {t("scans.error")}
          </p>
        ) : (
          <ScanHistoryList items={scansQuery.data?.data ?? []} />
        )}
      </section>
    </div>
  );
};
