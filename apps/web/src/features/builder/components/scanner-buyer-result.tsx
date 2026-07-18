"use client";

import type { QrBuyerActionPayload } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { PORTAL_MAX_PAGE_SIZE } from "@/features/builder/constants";
import { useCreateDealFromScanMutation } from "@/features/builder/hooks/use-portal-crm";
import { usePortalProjectsQuery } from "@/features/builder/hooks/use-portal-projects";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { FormField } from "@/shared/ui/form-field";

type ScannerBuyerResultProps = {
  payload: QrBuyerActionPayload;
  onReset: () => void;
};

/**
 * Buyer card after successful QR resolve + create deal action.
 */
export const ScannerBuyerResult = ({
  payload,
  onReset,
}: ScannerBuyerResultProps) => {
  const t = useTranslations("Builder.scanner");
  const projectsQuery = usePortalProjectsQuery(1, PORTAL_MAX_PAGE_SIZE);
  const mutation = useCreateDealFromScanMutation();
  const [projectId, setProjectId] = useState("");
  const [dealId, setDealId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onCreate = async () => {
    setError(null);
    try {
      const result = await mutation.mutateAsync({
        scanEventId: payload.scanEventId,
        ...(projectId ? { projectId } : {}),
      });
      setDealId(result.dealId);
    } catch {
      setError(t("errors.create"));
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
        <Button type="button" variant="ghost" size="sm" onClick={onReset}>
          {t("scanAgain")}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          {t("buyerBadge")}
        </p>
        <h2 className="mt-1 text-xl font-semibold text-ink">{payload.name}</h2>
      </div>
      <dl className="flex flex-col gap-2 text-sm">
        <div>
          <dt className="text-xs text-ink-muted">{t("phone")}</dt>
          <dd className="font-medium text-ink">{payload.phone}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-muted">{t("email")}</dt>
          <dd className="font-medium text-ink">{payload.email}</dd>
        </div>
      </dl>

      <FormField id="scan-project" label={t("projectOptional")}>
        <select
          id="scan-project"
          className="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm text-ink"
          value={projectId}
          onChange={(event) => {
            setProjectId(event.target.value);
          }}
        >
          <option value="">{t("noProject")}</option>
          {(projectsQuery.data?.data ?? []).map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </FormField>

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
        {mutation.isPending ? t("creating") : t("createDeal")}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onReset}>
        {t("scanAgain")}
      </Button>
    </Card>
  );
};
