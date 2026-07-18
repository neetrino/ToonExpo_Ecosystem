"use client";

import type { BoothSummary } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";

import { resolveMediaUrl } from "@/features/exhibition/utils/resolve-media-url";
import { cn } from "@/shared/ui/cn";

type AdminBoothMapPickerProps = {
  mediaAssetId: string;
  mediaFileUrl?: string | null;
  booths: BoothSummary[];
  selectedBoothId: string | null;
  onSelectBooth: (boothId: string) => void;
  onPickCoordinates: (xPercent: number, yPercent: number) => void;
};

/**
 * Venue map image with clickable booth placement.
 */
export const AdminBoothMapPicker = ({
  mediaAssetId,
  mediaFileUrl,
  booths,
  selectedBoothId,
  onSelectBooth,
  onPickCoordinates,
}: AdminBoothMapPickerProps) => {
  const t = useTranslations("Admin.events.booths.map");
  const imageUrl = resolveMediaUrl(mediaAssetId, mediaFileUrl);

  if (!imageUrl) {
    return (
      <p className="rounded-sm border border-dashed border-border px-4 py-6 text-sm text-ink-secondary">
        {t("noImage")}
      </p>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden rounded-sm border border-border"
      role="presentation"
    >
      <button
        type="button"
        className="relative block w-full cursor-crosshair"
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const xPercent = ((event.clientX - rect.left) / rect.width) * 100;
          const yPercent = ((event.clientY - rect.top) / rect.height) * 100;
          onPickCoordinates(
            Math.round(xPercent * 100) / 100,
            Math.round(yPercent * 100) / 100,
          );
        }}
      >
        <img
          src={imageUrl}
          alt={t("alt")}
          className="h-auto w-full"
        />
        {booths.map((booth) => (
          <span
            key={booth.id}
            className={cn(
              "absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-brand",
              selectedBoothId === booth.id && "ring-2 ring-brand",
            )}
            style={{
              left: `${booth.xPercent}%`,
              top: `${booth.yPercent}%`,
            }}
            onClick={(event) => {
              event.stopPropagation();
              onSelectBooth(booth.id);
            }}
          />
        ))}
      </button>
      <p className="border-t border-border px-3 py-2 text-xs text-ink-muted">
        {t("hint")}
      </p>
    </div>
  );
};
