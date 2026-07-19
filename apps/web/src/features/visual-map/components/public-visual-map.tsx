"use client";

import type { PublicVisualCanvasItem, PublicVisualHotspotItem } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { PercentMapMarkers } from "@/features/visual-map/components/percent-map-markers";
import { PublicVisualHotspotSheet } from "@/features/visual-map/components/public-visual-hotspot-sheet";

type PublicVisualMapProps = {
  canvas: PublicVisualCanvasItem;
  buildTargetHref: (hotspot: PublicVisualHotspotItem) => string;
};

/**
 * Public visual map with tappable SVG markers and optional bottom sheet.
 */
export const PublicVisualMap = ({
  canvas,
  buildTargetHref,
}: PublicVisualMapProps) => {
  const t = useTranslations("Catalog.visualMap");
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);

  if (canvas.hotspots.length === 0) {
    return null;
  }

  const imageUrl = canvas.media.fileUrl;
  const selectedHotspot =
    canvas.hotspots.find((hotspot) => hotspot.id === selectedHotspotId) ?? null;

  const markers = canvas.hotspots.map((hotspot) => ({
    id: hotspot.id,
    label: hotspot.label,
    xPercent: hotspot.xPercent,
    yPercent: hotspot.yPercent,
    selected: selectedHotspotId === hotspot.id,
  }));

  return (
    <section className="mb-8 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-ink">
          {canvas.title ?? t("title")}
        </h2>
        <p className="text-xs text-ink-secondary">{t("viewAsList")}</p>
      </div>
      <div className="relative w-full overflow-x-auto rounded-md border border-border bg-surface">
        <div className="relative min-w-[280px]">
          <img
            src={imageUrl}
            alt={canvas.media.altText ?? canvas.title ?? t("alt")}
            className="h-auto w-full"
          />
          <PercentMapMarkers
            markers={markers}
            interactive
            showLabels
            onSelectMarker={setSelectedHotspotId}
          />
        </div>
      </div>
      {selectedHotspot ? (
        <PublicVisualHotspotSheet
          hotspot={selectedHotspot}
          targetHref={buildTargetHref(selectedHotspot)}
          onClose={() => setSelectedHotspotId(null)}
        />
      ) : null}
    </section>
  );
};
