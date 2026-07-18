"use client";

import type { QrBuyerActionPayload } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useCreateDealFromScanMutation } from "@/features/buyer/hooks/use-buyer";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

type BuyerActionCardProps = {
  payload: QrBuyerActionPayload;
};

/**
 * Builder scan result: buyer contacts + create CRM deal from scan.
 */
export const BuyerActionCard = ({ payload }: BuyerActionCardProps) => {
  const t = useTranslations("QrLanding.buyerAction");
  const mutation = useCreateDealFromScanMutation();
  const [dealId, setDealId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onCreate = async () => {
    setError(null);
    try {
      const result = await mutation.mutateAsync({
        scanEventId: payload.scanEventId,
      });
      setDealId(result.dealId);
    } catch {
      setError(t("errors.generic"));
    }
  };

  if (dealId) {
    return (
      <Card className="flex flex-col gap-4">
        <p className="text-sm text-ink" role="status">
          {t("success")}
        </p>
        <Link
          href={`/builder/crm/deals/${dealId}`}
          className="text-sm font-semibold text-brand hover:underline"
        >
          {t("openDeal")}
        </Link>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          {t("badge")}
        </p>
        <h1 className="mt-1 font-brand text-2xl font-bold text-ink">
          {payload.name}
        </h1>
      </div>
      <dl className="flex flex-col gap-3">
        <div>
          <dt className="text-xs text-ink-muted">{t("phone")}</dt>
          <dd className="text-sm font-medium text-ink">{payload.phone}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-muted">{t("email")}</dt>
          <dd className="text-sm font-medium text-ink">{payload.email}</dd>
        </div>
      </dl>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <Button
        type="button"
        className="w-full"
        disabled={mutation.isPending}
        onClick={() => {
          void onCreate();
        }}
      >
        {mutation.isPending ? t("submitting") : t("createRequest")}
      </Button>
    </Card>
  );
};
