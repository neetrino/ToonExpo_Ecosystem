"use client";

import { QRCodeSVG } from "qrcode.react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

import { QR_DISPLAY_SIZE_PX } from "@/features/buyer/constants";
import { usePortalProjectQrQuery } from "@/features/builder/hooks/use-portal-projects";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

type ProjectQrSectionProps = {
  projectId: string;
  projectName: string;
};

/**
 * Exhibition Project QR card with copy-link action.
 */
export const ProjectQrSection = ({
  projectId,
  projectName,
}: ProjectQrSectionProps) => {
  const t = useTranslations("Builder.projects.qr");
  const qrQuery = usePortalProjectQrQuery(projectId);
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async (payloadUrl: string) => {
    try {
      await navigator.clipboard.writeText(payloadUrl);
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  }, []);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-ink">{t("title")}</h2>
        <p className="text-sm text-ink-secondary">{t("subtitle")}</p>
      </div>

      {qrQuery.isLoading ? (
        <p className="text-sm text-ink-secondary">{t("loading")}</p>
      ) : qrQuery.isError || !qrQuery.data ? (
        <p role="alert" className="text-sm text-danger">
          {t("error")}
        </p>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="rounded-md bg-white p-3 shadow-sm">
            <QRCodeSVG
              value={qrQuery.data.payloadUrl}
              size={QR_DISPLAY_SIZE_PX}
              level="M"
              marginSize={2}
              title={t("codeTitle", { name: projectName })}
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <p className="break-all text-xs text-ink-secondary">
              {qrQuery.data.payloadUrl}
            </p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="self-start"
              onClick={() => {
                void onCopy(qrQuery.data.payloadUrl);
              }}
            >
              {copied ? t("copied") : t("copyLink")}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
