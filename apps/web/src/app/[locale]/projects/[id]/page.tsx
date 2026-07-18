import type { Metadata } from "next";
import Image from "next/image";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";

import { getProject } from "@/features/catalog/api/catalog-api";
import { ProjectBuildings } from "@/features/catalog/components/project-buildings";
import { RequestPriceButton } from "@/features/catalog/components/request-price-button";
import { SiteFooter } from "@/features/catalog/components/site-footer";
import { listProjectVisualCanvases } from "@/features/visual-map/api/public-visual-map-api";
import { PublicVisualMap } from "@/features/visual-map/components/public-visual-map";
import {
  buildProjectBuildingHref,
  pickPrimaryVisualCanvas,
} from "@/features/visual-map/utils/public-visual-map";
import {
  formatCompactPrice,
  formatPriceRange,
} from "@/features/catalog/utils/format-price";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/shared/ui/site-header";

type ProjectPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

const loadProject = async (id: string, locale: string) => {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? undefined;
  return getProject(id, { locale, cookieHeader });
};

export const generateMetadata = async ({
  params,
}: ProjectPageProps): Promise<Metadata> => {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "Catalog" });
  const project = await loadProject(id, locale);

  if (!project) {
    return { title: t("project.notFoundTitle") };
  }

  return {
    title: project.name,
    description:
      project.shortDescription ??
      t("project.metaFallback", { name: project.name }),
  };
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const project = await loadProject(id, locale);
  if (!project) {
    notFound();
  }

  const t = await getTranslations("Catalog");
  const activeLocale = await getLocale();
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? undefined;
  const visualResponse = await listProjectVisualCanvases(id, { cookieHeader });
  const visualCanvas = pickPrimaryVisualCanvas(visualResponse?.data ?? []);
  const location =
    project.locationText ??
    [project.district, project.city].filter(Boolean).join(", ");
  const priceRange = formatPriceRange({
    minPrice: project.minPrice,
    maxPrice: project.maxPrice,
    currency: project.priceCurrency,
    locale: activeLocale,
    onRequestLabel: t("price.onRequest"),
  });
  const fromPrice = formatCompactPrice({
    amount: project.minPrice,
    currency: project.priceCurrency,
    locale: activeLocale,
    fromLabel: t("price.from"),
    onRequestLabel: t("price.onRequest"),
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="relative isolate h-[min(50vh,420px)] w-full overflow-hidden bg-surface">
          {project.cover ? (
            <Image
              src={project.cover.fileUrl}
              alt={project.cover.altText ?? project.name}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-ink/10" />
          <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-content px-6 pb-8">
            <p className="text-xs font-medium uppercase tracking-widest text-on-dark/80">
              {project.builder.name}
              {location ? ` · ${location}` : null}
            </p>
            <h1 className="mt-2 font-brand text-3xl font-bold text-on-dark sm:text-4xl">
              {project.name}
            </h1>
            <p className="mt-2 text-sm text-on-dark/90">{fromPrice}</p>
          </div>
        </section>

        <div className="mx-auto w-full max-w-content px-6 py-10">
          <div className="mb-8 grid gap-4 rounded-md bg-surface p-4 sm:grid-cols-4 sm:p-6">
            <Stat
              label={t("availability.total")}
              value={project.availability.total}
            />
            <Stat
              label={t("availability.available")}
              value={project.availability.available}
            />
            <Stat
              label={t("availability.reserved")}
              value={project.availability.reserved}
            />
            <Stat
              label={t("availability.sold")}
              value={project.availability.sold}
            />
          </div>

          <div className="mb-10 max-w-3xl">
            <h2 className="text-xl font-bold text-ink">
              {t("project.about")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              {project.fullDescription ??
                project.shortDescription ??
                t("project.noDescription")}
            </p>
            <p className="mt-4 text-sm text-ink">
              <span className="font-medium">{t("project.priceRange")}: </span>
              {priceRange}
            </p>
            {project.address ? (
              <p className="mt-2 text-sm text-ink-secondary">
                {project.address}
              </p>
            ) : null}
            <div className="mt-6">
              <RequestPriceButton
                projectId={project.id}
                labelKey="requestInfo"
              />
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-ink">
              {t("project.units")}
            </h2>
            <Link
              href="/projects"
              className="text-sm font-semibold text-ink hover:text-brand"
            >
              {t("actions.backToProjects")}
            </Link>
          </div>

          {visualCanvas ? (
            <PublicVisualMap
              canvas={visualCanvas}
              buildTargetHref={(hotspot) =>
                buildProjectBuildingHref(project.id, hotspot)
              }
            />
          ) : null}

          <ProjectBuildings projectId={project.id} buildings={project.buildings} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

const Stat = ({ label, value }: { label: string; value: number }) => {
  return (
    <div className="rounded-sm bg-background px-3 py-4 text-center">
      <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
        {label}
      </p>
      <p className="mt-1 font-brand text-2xl font-bold text-ink">{value}</p>
    </div>
  );
};
