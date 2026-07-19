"use client";

import type { PortalVisualHotspotItem } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";

import {
  PercentMapMarkers,
  percentFromPointer,
} from "@/features/visual-map/components/percent-map-markers";
import { resolveMediaUrl } from "@/features/exhibition/utils/resolve-media-url";

type PortalHotspotMapPickerProps = {
  mediaAssetId: string;
  mediaFileUrl?: string | null;
  hotspots: PortalVisualHotspotItem[];
  selectedHotspotId: string | null;
  onSelectHotspot: (hotspotId: string) => void;
  onPickCoordinates: (xPercent: number, yPercent: number) => void;
};

/**
 * Visual canvas image with click-to-place hotspot markers.
 */
export const PortalHotspotMapPicker = ({
  mediaAssetId,
  mediaFileUrl,
  hotspots,
  selectedHotspotId,
  onSelectHotspot,
  onPickCoordinates,
}: PortalHotspotMapPickerProps) => {
  const t = useTranslations("Builder.visualMap.editor.map");
  const imageUrl = resolveMediaUrl(mediaAssetId, mediaFileUrl);

  if (!imageUrl) {
    return (
      <p className="rounded-sm border border-dashed border-border px-4 py-6 text-sm text-ink-secondary">
        {t("noImage")}
      </p>
    );
  }

  const markers = hotspots.map((hotspot) => ({
    id: hotspot.id,
    label: hotspot.label,
    xPercent: hotspot.xPercent,
    yPercent: hotspot.yPercent,
    warning: hotspot.targetStatus !== "ok",
    selected: selectedHotspotId === hotspot.id,
  }));

  return (
    <div className="relative w-full overflow-hidden rounded-sm border border-border">
      <button
        type="button"
        className="relative block w-full cursor-crosshair"
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const coords = percentFromPointer(event.clientX, event.clientY, rect);
          onPickCoordinates(coords.xPercent, coords.yPercent);
        }}
      >
        <img src={imageUrl} alt={t("alt")} className="h-auto w-full" />
        <PercentMapMarkers
          markers={markers}
          interactive
          onSelectMarker={onSelectHotspot}
        />
      </button>
      <p className="border-t border-border px-3 py-2 text-xs text-ink-muted">
        {t("hint")}
      </p>
    </div>
  );
};
