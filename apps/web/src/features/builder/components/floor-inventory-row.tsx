"use client";

import type { PortalFloorSummary } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { BulkApartmentsForm } from "@/features/builder/components/bulk-apartments-form";
import { usePortalFloorApartmentsQuery } from "@/features/builder/hooks/use-portal-inventory";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";

type FloorInventoryRowProps = {
  projectId: string;
  floor: PortalFloorSummary;
};

/**
 * Floor row with apartment list and bulk-add toggle.
 */
export const FloorInventoryRow = ({
  projectId,
  floor,
}: FloorInventoryRowProps) => {
  const t = useTranslations("Builder.inventory");
  const [showBulk, setShowBulk] = useState(false);
  const apartmentsQuery = usePortalFloorApartmentsQuery(floor.id);

  return (
    <div className="rounded-sm border border-border bg-surface/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-ink">
            {floor.name || floor.displayLabel
              ? t("floorLabelNamed", {
                  number: floor.number,
                  name: floor.name ?? floor.displayLabel ?? "",
                })
              : t("floorLabel", { number: floor.number })}
          </p>
          <p className="text-xs text-ink-muted">
            {t("apartmentsCount", { count: floor.apartmentsCount })} ·{" "}
            {t(`publication.${floor.publicationStatus}`)}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            setShowBulk((value) => !value);
          }}
        >
          {showBulk ? t("cancel") : t("addApartments")}
        </Button>
      </div>

      {apartmentsQuery.isLoading ? (
        <p className="mt-2 text-xs text-ink-secondary">{t("loading")}</p>
      ) : null}

      {apartmentsQuery.data && apartmentsQuery.data.length > 0 ? (
        <ul className="mt-2 flex flex-col gap-1">
          {apartmentsQuery.data.map((apartment) => (
            <li key={apartment.id} className="text-sm">
              <Link
                href={`/builder/apartments/${apartment.id}`}
                className="text-brand hover:underline"
              >
                {t("apartmentLink", {
                  number: apartment.number,
                  status: apartment.salesStatus,
                })}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {showBulk ? (
        <BulkApartmentsForm
          projectId={projectId}
          floorId={floor.id}
          onDone={() => {
            setShowBulk(false);
          }}
        />
      ) : null}
    </div>
  );
};
