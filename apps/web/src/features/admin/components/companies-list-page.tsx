"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { CompaniesTable } from "@/features/admin/components/companies-table";
import { ADMIN_COMPANIES_DEFAULT_PAGE_SIZE } from "@/features/admin/constants";
import { useAdminCompaniesQuery } from "@/features/admin/hooks/use-admin-companies";
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
 * Admin companies list with pagination, loading, error, and empty states.
 */
export const CompaniesListPage = () => {
  const t = useTranslations("Admin.companies");
  const searchParams = useSearchParams();
  const page = parsePage(searchParams.get("page"));
  const pageSize = ADMIN_COMPANIES_DEFAULT_PAGE_SIZE;
  const query = useAdminCompaniesQuery(page, pageSize);

  if (query.isLoading) {
    return <p className="text-sm text-ink-secondary">{t("loading")}</p>;
  }

  if (query.isError) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t("error")}
      </p>
    );
  }

  const response = query.data;
  if (!response) {
    return null;
  }

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
          href="/admin/companies/new"
          className="inline-flex h-9 items-center justify-center rounded-pill bg-cta-dark px-4 text-sm font-medium text-on-dark hover:bg-cta-dark/90"
        >
          {t("newCompany")}
        </Link>
      </div>

      {response.data.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t("empty")}</p>
      ) : (
        <CompaniesTable companies={response.data} />
      )}

      <CatalogPagination
        page={response.meta.page}
        totalPages={response.meta.totalPages}
        buildHref={(nextPage) =>
          nextPage <= 1
            ? "/admin/companies"
            : `/admin/companies?page=${nextPage}`
        }
        previousLabel={t("pagination.previous")}
        nextLabel={t("pagination.next")}
        ariaLabel={t("pagination.ariaLabel")}
      />
    </div>
  );
};
