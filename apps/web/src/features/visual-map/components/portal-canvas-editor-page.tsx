"use client";

import type {
  PortalProjectDetail,
  PortalVisualHotspotItem,
} from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { PortalHotspotForm } from "@/features/visual-map/components/portal-hotspot-form";
import {
  toHotspotBody,
} from "@/features/visual-map/utils/portal-request-mappers";
import { PortalHotspotMapPicker } from "@/features/visual-map/components/portal-hotspot-map-picker";
import {
  useCreatePortalVisualHotspotMutation,
  useDeletePortalVisualHotspotMutation,
  usePortalVisualCanvasQuery,
  useUpdatePortalVisualCanvasMutation,
  useUpdatePortalVisualHotspotMutation,
} from "@/features/visual-map/hooks/use-portal-visual-map";
import { PublicationStatusBadge } from "@/features/partners/components/partner-badges";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { cn } from "@/shared/ui/cn";

type PortalCanvasEditorPageProps = {
  project: PortalProjectDetail;
  canvasId: string;
};

/**
 * Builder portal visual canvas editor with click-to-place hotspots.
 */
export const PortalCanvasEditorPage = ({
  project,
  canvasId,
}: PortalCanvasEditorPageProps) => {
  const t = useTranslations("Builder.visualMap.editor");
  const canvasQuery = usePortalVisualCanvasQuery(canvasId);
  const updateCanvasMutation = useUpdatePortalVisualCanvasMutation(
    project.id,
    canvasId,
  );
  const createHotspotMutation = useCreatePortalVisualHotspotMutation(
    project.id,
    canvasId,
  );
  const updateHotspotMutation = useUpdatePortalVisualHotspotMutation(
    project.id,
    canvasId,
  );
  const deleteHotspotMutation = useDeletePortalVisualHotspotMutation(
    project.id,
    canvasId,
  );

  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [pickedCoordinates, setPickedCoordinates] = useState<{
    xPercent: number;
    yPercent: number;
  } | null>(null);

  if (canvasQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">{t("loading")}</p>;
  }

  if (canvasQuery.isError || !canvasQuery.data) {
    return (
      <div className="flex flex-col gap-3">
        <p role="alert" className="text-sm text-danger">
          {t("notFound")}
        </p>
        <Link
          href={`/builder/projects/${project.id}`}
          className="text-sm font-medium text-brand hover:underline"
        >
          {t("back")}
        </Link>
      </div>
    );
  }

  const canvas = canvasQuery.data;
  const hotspots = canvas.hotspots;
  const selectedHotspot =
    hotspots.find((hotspot) => hotspot.id === selectedHotspotId) ?? null;
  const hotspotBusy =
    createHotspotMutation.isPending ||
    updateHotspotMutation.isPending ||
    deleteHotspotMutation.isPending;

  const publishCanvas = async () => {
    await updateCanvasMutation.mutateAsync({ publicationStatus: "published" });
  };

  const archiveCanvas = async () => {
    await updateCanvasMutation.mutateAsync({ publicationStatus: "archived" });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Link
            href={`/builder/projects/${project.id}`}
            className="text-sm text-ink-secondary hover:text-ink"
          >
            {t("back")}
          </Link>
          <h1 className="text-xl font-semibold text-ink">
            {canvas.title ?? t("untitled")}
          </h1>
          <PublicationStatusBadge status={canvas.publicationStatus} />
        </div>
        <div className="flex flex-wrap gap-2">
          {canvas.publicationStatus !== "published" ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={updateCanvasMutation.isPending}
              onClick={() => {
                void publishCanvas();
              }}
            >
              {t("publish")}
            </Button>
          ) : null}
          {canvas.publicationStatus !== "archived" ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={updateCanvasMutation.isPending}
              onClick={() => {
                void archiveCanvas();
              }}
            >
              {t("archive")}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <PortalHotspotMapPicker
            mediaAssetId={canvas.mediaAssetId}
            mediaFileUrl={canvas.media.fileUrl}
            hotspots={hotspots}
            selectedHotspotId={selectedHotspotId}
            onSelectHotspot={(hotspotId) => {
              setCreating(false);
              setSelectedHotspotId(hotspotId);
              setPickedCoordinates(null);
            }}
            onPickCoordinates={(xPercent, yPercent) => {
              setCreating(true);
              setSelectedHotspotId(null);
              setPickedCoordinates({ xPercent, yPercent });
            }}
          />
          <HotspotList
            hotspots={hotspots}
            selectedHotspotId={selectedHotspotId}
            onSelect={(hotspotId) => {
              setCreating(false);
              setSelectedHotspotId(hotspotId);
              setPickedCoordinates(null);
            }}
          />
        </div>

        <Card className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink">
            {creating || selectedHotspot ? t("hotspotPanel") : t("hotspotEmpty")}
          </h2>
          {creating || selectedHotspot ? (
            <PortalHotspotForm
              project={project}
              contextType={canvas.contextType}
              contextId={canvas.contextId}
              initial={selectedHotspot ?? undefined}
              pickedCoordinates={pickedCoordinates}
              isBusy={hotspotBusy}
              onSubmit={async (values) => {
                const body = toHotspotBody(values);

                if (selectedHotspot) {
                  await updateHotspotMutation.mutateAsync({
                    hotspotId: selectedHotspot.id,
                    body,
                  });
                } else {
                  const created = await createHotspotMutation.mutateAsync(body);
                  setCreating(false);
                  setSelectedHotspotId(created.id);
                  setPickedCoordinates(null);
                }
              }}
              onDelete={
                selectedHotspot
                  ? async () => {
                      await deleteHotspotMutation.mutateAsync(selectedHotspot.id);
                      setSelectedHotspotId(null);
                    }
                  : undefined
              }
            />
          ) : (
            <p className="text-sm text-ink-secondary">{t("hotspotHint")}</p>
          )}
        </Card>
      </div>
    </div>
  );
};

type HotspotListProps = {
  hotspots: PortalVisualHotspotItem[];
  selectedHotspotId: string | null;
  onSelect: (hotspotId: string) => void;
};

const HotspotList = ({
  hotspots,
  selectedHotspotId,
  onSelect,
}: HotspotListProps) => {
  const t = useTranslations("Builder.visualMap.editor.hotspotList");

  if (hotspots.length === 0) {
    return (
      <p className="text-sm text-ink-secondary">{t("empty")}</p>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-sm border border-border">
      {hotspots.map((hotspot) => (
        <li key={hotspot.id}>
          <button
            type="button"
            className={cn(
              "flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-surface",
              selectedHotspotId === hotspot.id && "bg-surface",
            )}
            onClick={() => onSelect(hotspot.id)}
          >
            <span className="font-medium text-ink">{hotspot.label}</span>
            <span className="text-xs text-ink-secondary">
              {hotspot.targetStatus !== "ok"
                ? t(`targetStatus.${hotspot.targetStatus}`)
                : t(`publicationStatuses.${hotspot.publicationStatus}`)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
};
