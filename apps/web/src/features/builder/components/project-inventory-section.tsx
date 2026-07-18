"use client";

import type { PortalProjectDetail } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";

import { AddBuildingForm } from "@/features/builder/components/add-building-form";
import { BuildingAccordion } from "@/features/builder/components/building-accordion";

type ProjectInventorySectionProps = {
  project: PortalProjectDetail;
};

/**
 * Nested buildings → floors → apartments management for a project.
 */
export const ProjectInventorySection = ({
  project,
}: ProjectInventorySectionProps) => {
  const t = useTranslations("Builder.inventory");

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-ink">{t("title")}</h2>
        <p className="text-sm text-ink-secondary">{t("subtitle")}</p>
      </div>

      {project.buildings.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t("noBuildings")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {project.buildings.map((building) => (
            <BuildingAccordion
              key={building.id}
              projectId={project.id}
              building={building}
            />
          ))}
        </div>
      )}

      <AddBuildingForm projectId={project.id} />
    </section>
  );
};
