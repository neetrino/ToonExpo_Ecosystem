import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { listProjects } from "@/features/catalog/api/catalog-api";
import { CatalogFavoritesScope } from "@/features/buyer/components/catalog-favorites-scope";
import { CatalogPagination } from "@/features/catalog/components/catalog-pagination";
import { ProjectCard } from "@/features/catalog/components/project-card";
import { ProjectFiltersForm } from "@/features/catalog/components/project-filters-form";
import { SiteFooter } from "@/features/catalog/components/site-footer";
import {
  buildProjectSearchParams,
  parseProjectFilters,
  toListProjectsQuery,
} from "@/features/catalog/utils/project-filters";
import { SiteHeader } from "@/shared/ui/site-header";

type ProjectsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const generateMetadata = async ({
  params,
}: ProjectsPageProps): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Catalog" });

  return {
    title: t("projects.meta.title"),
    description: t("projects.meta.description"),
  };
};

export default async function ProjectsPage({
  params,
  searchParams,
}: ProjectsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Catalog");
  const rawParams = await searchParams;
  const filters = parseProjectFilters(rawParams);
  const response = await listProjects(toListProjectsQuery(filters), { locale });

  const buildHref = (page: number): string => {
    const query = new URLSearchParams(
      buildProjectSearchParams(filters, page),
    ).toString();
    return query.length > 0 ? `/projects?${query}` : "/projects";
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-content px-6 py-10">
        <header className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            {t("projects.title")}
          </h1>
          <p className="text-sm text-ink-secondary">
            {t("projects.subtitle", { count: response.meta.total })}
          </p>
        </header>

        <ProjectFiltersForm filters={filters} />

        {response.data.length === 0 ? (
          <p className="mt-10 text-sm text-ink-secondary">
            {t("projects.empty")}
          </p>
        ) : (
          <CatalogFavoritesScope projects={response.data}>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {response.data.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  showFavorite
                />
              ))}
            </div>
          </CatalogFavoritesScope>
        )}

        <CatalogPagination
          className="mt-10"
          page={response.meta.page}
          totalPages={response.meta.totalPages}
          buildHref={buildHref}
          previousLabel={t("pagination.previous")}
          nextLabel={t("pagination.next")}
          ariaLabel={t("pagination.ariaLabel")}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
