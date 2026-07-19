"use client";

import type { PublicVisualHotspotItem } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

type PublicVisualHotspotSheetProps = {
  hotspot: PublicVisualHotspotItem;
  targetHref: string;
  onClose: () => void;
};

/**
 * Mobile-friendly bottom sheet for a selected public visual hotspot.
 */
export const PublicVisualHotspotSheet = ({
  hotspot,
  targetHref,
  onClose,
}: PublicVisualHotspotSheetProps) => {
  const t = useTranslations("Catalog.visualMap.hotspot");

  return (
    <Card className="flex flex-col gap-3 border-t-4 border-brand px-4 py-4 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            {t(`targetTypes.${hotspot.target.type}`)}
          </p>
          <h3 className="text-lg font-semibold text-ink">{hotspot.label}</h3>
          <p className="text-sm text-ink-secondary">{hotspot.target.displayName}</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {t("close")}
        </Button>
      </div>
      <Link href={targetHref}>
        <Button type="button" size="sm" variant="secondary" className="w-full sm:w-auto">
          {t("openTarget")}
        </Button>
      </Link>
    </Card>
  );
};
