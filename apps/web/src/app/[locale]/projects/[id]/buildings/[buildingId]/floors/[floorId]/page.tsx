import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { cache } from "react";

import { FloorApartmentsList } from "@/features/catalog/components/building-floor-lists";
import { ProjectPricesOverlayScope } from "@/features/catalog/components/price-overlay-scope";
import { getFloor } from "@/features/catalog/api/catalog-api";
import { SiteFooter } from "@/features/catalog/components/site-footer";
import { listFloorVisualCanvases } from "@/features/visual-map/api/public-visual-map-api";
import { PublicVisualMap } from "@/features/visual-map/components/public-visual-map";
import {
  buildFloorApartmentHref,
  pickPrimaryVisualCanvas,
} from "@/features/visual-map/utils/public-visual-map";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/shared/ui/site-header";

type FloorPageProps = {
  params: Promise<{
    locale: string;
    id: string;
    buildingId: string;
    floorId: string;
  }>;
};

const loadFloor = cache((floorId: string, locale: string, projectId: string) =>
  getFloor(floorId, { locale, projectId }),
);

export const generateMetadata = async ({
  params,
}: FloorPageProps): Promise<Metadata> => {
  const { locale, id, floorId } = await params;
  const t = await getTranslations({ locale, namespace: "Catalog" });
  const floor = await loadFloor(floorId, locale, id);

  if (!floor) {
    return { title: t("floor.notFoundTitle") };
  }

  const floorLabel = floor.displayLabel ?? String(floor.number);
  return {
    title: `${floorLabel} — ${floor.building.name}`,
  };
};

export default async function FloorPage({ params }: FloorPageProps) {
  const { locale, id, buildingId, floorId } = await params;
  setRequestLocale(locale);

  const floor = await loadFloor(floorId, locale, id);

  if (
    !floor ||
    floor.project.id !== id ||
    floor.building.id !== buildingId
  ) {
    notFound();
  }

  const t = await getTranslations("Catalog");
  const visualResponse = await listFloorVisualCanvases(floorId);
  const visualCanvas = pickPrimaryVisualCanvas(visualResponse?.data ?? []);
  const floorLabel = floor.displayLabel ?? t("project.floor", { number: floor.number });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-content px-6 py-10">
        <div className="mb-6 flex flex-col gap-2">
          <Link
            href={`/projects/${floor.project.id}/buildings/${floor.building.id}`}
            className="text-sm text-ink-secondary hover:text-ink"
          >
            {t("floor.backToBuilding")}
          </Link>
          <h1 className="font-brand text-2xl font-bold text-ink">{floorLabel}</h1>
          <p className="text-sm text-ink-secondary">
            {floor.building.name} · {floor.project.name}
          </p>
        </div>

        {visualCanvas ? (
          <PublicVisualMap
            canvas={visualCanvas}
            buildTargetHref={buildFloorApartmentHref}
          />
        ) : null}

        <div className="mb-4">
          <h2 className="text-xl font-bold text-ink">{t("floor.apartments")}</h2>
        </div>
        <ProjectPricesOverlayScope projectId={floor.project.id}>
          <FloorApartmentsList floor={floor} />
        </ProjectPricesOverlayScope>
      </main>
      <SiteFooter />
    </div>
  );
}
