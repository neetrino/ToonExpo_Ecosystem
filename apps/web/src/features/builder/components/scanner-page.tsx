"use client";

import type { QrBuyerActionPayload } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { ScannerBuyerResult } from "@/features/builder/components/scanner-buyer-result";
import { ScannerCamera } from "@/features/builder/components/scanner-camera";
import {
  extractQrToken,
  isNonToonexpoQrPayload,
} from "@/features/builder/utils/extract-qr-token";
import { resolveQrToken } from "@/features/buyer/api/qr-resolve-api";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

type ResolveState =
  | { status: "idle" }
  | { status: "resolving" }
  | { status: "buyer"; payload: QrBuyerActionPayload }
  | { status: "error"; message: string };

/**
 * Mobile-first builder QR scanner with camera + manual token fallback.
 */
export const ScannerPage = () => {
  const t = useTranslations("Builder.scanner");
  const [manual, setManual] = useState("");
  const [state, setState] = useState<ResolveState>({ status: "idle" });
  const paused = state.status === "resolving" || state.status === "buyer";

  const resolveToken = async (raw: string) => {
    if (isNonToonexpoQrPayload(raw)) {
      setState({ status: "error", message: t("errors.notToonexpo") });
      return;
    }
    const token = extractQrToken(raw);
    if (!token) {
      setState({ status: "error", message: t("errors.invalid") });
      return;
    }

    setState({ status: "resolving" });
    try {
      const data = await resolveQrToken({ token });
      if (data.kind === "buyer_action") {
        setState({ status: "buyer", payload: data });
        return;
      }
      setState({ status: "error", message: t("errors.notBuyer") });
    } catch {
      setState({ status: "error", message: t("errors.resolve") });
    }
  };

  const reset = () => {
    setState({ status: "idle" });
    setManual("");
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-ink">{t("title")}</h1>
        <p className="text-sm text-ink-secondary">{t("subtitle")}</p>
      </div>

      {state.status === "buyer" ? (
        <ScannerBuyerResult payload={state.payload} onReset={reset} />
      ) : (
        <>
          <ScannerCamera
            paused={paused}
            onToken={(raw) => {
              void resolveToken(raw);
            }}
          />

          {state.status === "resolving" ? (
            <p className="text-sm text-ink-secondary">{t("resolving")}</p>
          ) : null}

          {state.status === "error" ? (
            <p role="alert" className="text-sm text-danger">
              {state.message}
            </p>
          ) : null}

          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              void resolveToken(manual);
            }}
          >
            <FormField id="manual-token" label={t("manualLabel")}>
              <Input
                id="manual-token"
                value={manual}
                placeholder={t("manualPlaceholder")}
                onChange={(event) => {
                  setManual(event.target.value);
                }}
              />
            </FormField>
            <Button type="submit" variant="secondary" className="w-full">
              {t("manualSubmit")}
            </Button>
          </form>
        </>
      )}
    </div>
  );
};
