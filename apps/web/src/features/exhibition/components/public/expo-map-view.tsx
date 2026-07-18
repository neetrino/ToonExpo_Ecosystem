"use client";

import type { PublicBoothDetail, RoutePathNode } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { resolveMediaUrl } from "@/features/exhibition/utils/resolve-media-url";
import { cn } from "@/shared/ui/cn";

type ExpoMapViewProps = {
  mediaAssetId: string;
  booths: PublicBoothDetail[];
  highlightedBoothId: string | null;
  routeNodes: RoutePathNode[];
  routeAvailable: boolean;
  onSelectBooth: (boothId: string) => void;
};

/**
 * Venue map image with booth markers and optional route polyline overlay.
 */
export const ExpoMapView = ({
  mediaAssetId,
  booths,
  highlightedBoothId,
  routeNodes,
  routeAvailable,
  onSelectBooth,
}: ExpoMapViewProps) => {
  const t = useTranslations("Expo.map");
  const imageUrl = resolveMediaUrl(mediaAssetId);
  const polylinePoints = useMemo(
    () =>
      routeNodes
        .map((node) => `${node.xPercent},${node.yPercent}`)
        .join(" "),
    [routeNodes],
  );

  if (!imageUrl) {
    return (
      <div className="rounded-sm border border-dashed border-border px-4 py-8 text-center text-sm text-ink-secondary">
        {t("noImage")}
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-sm border border-border">
      <div className="relative">
        <img
          src={imageUrl}
          alt={t("alt")}
          className="h-auto w-full"
        />
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden={routeNodes.length === 0}
        >
          {routeAvailable && polylinePoints ? (
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              className="text-brand"
            />
          ) : null}
        </svg>
        {booths.map((booth) => (
          <button
            key={booth.id}
            type="button"
            className={cn(
              "absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-brand shadow-sm",
              highlightedBoothId === booth.id && "ring-2 ring-brand ring-offset-2",
            )}
            style={{
              left: `${booth.xPercent}%`,
              top: `${booth.yPercent}%`,
            }}
            aria-label={booth.code}
            onClick={() => onSelectBooth(booth.id)}
          />
        ))}
      </div>
    </div>
  );
};
