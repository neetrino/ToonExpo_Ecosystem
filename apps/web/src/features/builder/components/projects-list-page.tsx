"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { ProjectsTable } from "@/features/builder/components/projects-table";
import { PORTAL_DEFAULT_PAGE_SIZE } from "@/features/builder/constants";
import { usePortalProjectsQuery } from "@/features/builder/hooks/use-portal-projects";
import { CatalogPagination } from "@/features/catalog/components/catalog-pagination";
import { Link } from "@/i18n/navigation";

const parsePage = (raw: string | null): number => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
};

/**
 * Builder projects list with pagination and create CTA.
 */
export const ProjectsListPage = () => {
  const t = useTranslations("Builder.projects");
  const searchParams = useSearchParams();
  const page = parsePage(searchParams.get("page"));
  const pageSize = PORTAL_DEFAULT_PAGE_SIZE;
  const query = usePortalProjectsQuery(page, pageSize);

  if (query.isLoading) {
    return <p className="text-sm text-ink-secondary">{t("loading")}</p>;
  }

  if (query.isError || !query.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t("error")}
      </p>
    );
  }

  const response = query.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-ink">{t("title")}</h1>
          <p className="text-sm text-ink-secondary">
            {t("subtitle", { count: response.meta.total })}
          </p>
        </div>
        <Link
          href="/builder/projects/new"
          className="inline-flex h-9 items-center justify-center rounded-pill bg-cta-dark px-4 text-sm font-medium text-on-dark hover:bg-cta-dark/90"
        >
          {t("newProject")}
        </Link>
      </div>

      {response.data.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t("empty")}</p>
      ) : (
        <ProjectsTable projects={response.data} />
      )}

      <CatalogPagination
        page={response.meta.page}
        totalPages={response.meta.totalPages}
        buildHref={(nextPage) =>
          nextPage <= 1
            ? "/builder/projects"
            : `/builder/projects?page=${nextPage}`
        }
        previousLabel={t("pagination.previous")}
        nextLabel={t("pagination.next")}
        ariaLabel={t("pagination.ariaLabel")}
      />
    </div>
  );
};
