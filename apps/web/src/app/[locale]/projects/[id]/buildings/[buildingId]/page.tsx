import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BuildingFloorsList } from "@/features/catalog/components/building-floor-lists";
import { getProject } from "@/features/catalog/api/catalog-api";
import { listBuildingVisualCanvases } from "@/features/visual-map/api/public-visual-map-api";
import { PublicVisualMap } from "@/features/visual-map/components/public-visual-map";
import {
  buildBuildingFloorHref,
  pickPrimaryVisualCanvas,
} from "@/features/visual-map/utils/public-visual-map";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/shared/ui/site-header";
import { SiteFooter } from "@/features/catalog/components/site-footer";

type BuildingPageProps = {
  params: Promise<{ locale: string; id: string; buildingId: string }>;
};

const loadProject = async (id: string, locale: string) => {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? undefined;
  return getProject(id, { locale, cookieHeader });
};

export const generateMetadata = async ({
  params,
}: BuildingPageProps): Promise<Metadata> => {
  const { locale, id, buildingId } = await params;
  const t = await getTranslations({ locale, namespace: "Catalog" });
  const project = await loadProject(id, locale);
  const building = project?.buildings.find((item) => item.id === buildingId);

  if (!project || !building) {
    return { title: t("building.notFoundTitle") };
  }

  return {
    title: `${building.name} — ${project.name}`,
  };
};

export default async function BuildingPage({ params }: BuildingPageProps) {
  const { locale, id, buildingId } = await params;
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? undefined;
  const project = await loadProject(id, locale);
  const building = project?.buildings.find((item) => item.id === buildingId);

  if (!project || !building) {
    notFound();
  }

  const t = await getTranslations("Catalog");
  const visualResponse = await listBuildingVisualCanvases(buildingId, {
    cookieHeader,
  });
  const visualCanvas = pickPrimaryVisualCanvas(visualResponse?.data ?? []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-content px-6 py-10">
        <div className="mb-6 flex flex-col gap-2">
          <Link
            href={`/projects/${project.id}`}
            className="text-sm text-ink-secondary hover:text-ink"
          >
            {t("building.backToProject")}
          </Link>
          <h1 className="font-brand text-2xl font-bold text-ink">{building.name}</h1>
          <p className="text-sm text-ink-secondary">{project.name}</p>
        </div>

        {visualCanvas ? (
          <PublicVisualMap
            canvas={visualCanvas}
            buildTargetHref={(hotspot) =>
              buildBuildingFloorHref(project.id, building.id, hotspot)
            }
          />
        ) : null}

        <div className="mb-4">
          <h2 className="text-xl font-bold text-ink">{t("building.floors")}</h2>
        </div>
        <BuildingFloorsList projectId={project.id} building={building} />
      </main>
      <SiteFooter />
    </div>
  );
}
