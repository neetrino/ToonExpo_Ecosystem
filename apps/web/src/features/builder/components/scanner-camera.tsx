"use client";

import { Scanner } from "@yudiel/react-qr-scanner";
import { useTranslations } from "next-intl";
import { useState } from "react";

type ScannerCameraProps = {
  onToken: (raw: string) => void;
  paused: boolean;
};

/**
 * Camera QR scanner with permission-error fallback signal.
 */
export const ScannerCamera = ({ onToken, paused }: ScannerCameraProps) => {
  const t = useTranslations("Builder.scanner");
  const [cameraError, setCameraError] = useState<string | null>(null);

  if (cameraError) {
    return (
      <div className="rounded-sm border border-border bg-surface px-4 py-6 text-center">
        <p className="text-sm text-ink">{t("cameraDenied")}</p>
        <p className="mt-2 text-sm text-ink-secondary">{t("useManual")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-sm border border-border">
      <Scanner
        formats={["qr_code"]}
        paused={paused}
        sound={false}
        onScan={(results) => {
          const value = results[0]?.rawValue;
          if (value) {
            onToken(value);
          }
        }}
        onError={() => {
          setCameraError("denied");
        }}
        styles={{
          container: { width: "100%" },
        }}
      />
    </div>
  );
};
