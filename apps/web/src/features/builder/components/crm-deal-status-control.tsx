"use client";

import type { CrmDealDetail, CrmDealStatus } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useUpdateCrmDealMutation } from "@/features/builder/hooks/use-portal-crm";
import {
  crmStatusRequiresApartment,
  getCrmStatusSelectOptions,
} from "@/features/builder/utils/crm-status-transitions";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

type CrmDealStatusControlProps = {
  deal: CrmDealDetail;
};

/**
 * Status select with lost-reason gate and apartment-link hint.
 */
export const CrmDealStatusControl = ({ deal }: CrmDealStatusControlProps) => {
  const t = useTranslations("Builder.crm.detail");
  const tCrm = useTranslations("Builder.crm");
  const mutation = useUpdateCrmDealMutation(deal.id);
  const [status, setStatus] = useState<CrmDealStatus>(deal.status);
  const [lostReason, setLostReason] = useState(deal.lostReason ?? "");
  const [error, setError] = useState<string | null>(null);

  const options = getCrmStatusSelectOptions(deal.status);
  const needsApartment =
    crmStatusRequiresApartment(status) && deal.apartments.length === 0;
  const showLostReason = status === "lost";
  const dirty = status !== deal.status || (showLostReason && lostReason.trim());

  const onSave = async () => {
    setError(null);
    if (showLostReason && !lostReason.trim()) {
      setError(t("lostReasonRequired"));
      return;
    }
    if (needsApartment) {
      setError(t("apartmentRequired"));
      return;
    }
    try {
      await mutation.mutateAsync({
        status,
        ...(showLostReason ? { lostReason: lostReason.trim() } : {}),
      });
    } catch {
      setError(t("errors.generic"));
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-sm border border-border p-4">
      <h2 className="text-sm font-semibold text-ink">{t("statusTitle")}</h2>
      <FormField id="deal-status" label={t("status")}>
        <select
          id="deal-status"
          className="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm text-ink"
          value={status}
          disabled={options.length <= 1 || mutation.isPending}
          onChange={(event) => {
            setStatus(event.target.value as CrmDealStatus);
          }}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {tCrm(`statuses.${option}`)}
            </option>
          ))}
        </select>
      </FormField>

      {showLostReason ? (
        <FormField id="lost-reason" label={t("lostReason")}>
          <Input
            id="lost-reason"
            value={lostReason}
            onChange={(event) => {
              setLostReason(event.target.value);
            }}
          />
        </FormField>
      ) : null}

      {needsApartment ? (
        <p className="text-sm text-ink-muted">{t("apartmentHint")}</p>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        size="sm"
        disabled={!dirty || mutation.isPending}
        onClick={() => {
          void onSave();
        }}
      >
        {mutation.isPending ? t("saving") : t("saveStatus")}
      </Button>
    </div>
  );
};
