"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type {
  PartnerCompanyStatus,
  PartnerCompanyType,
  PublicationStatus,
} from "@toonexpo/contracts";

import { CreatePartnerPanel } from "@/features/admin/components/create-partner-panel";
import { PartnerFilters } from "@/features/admin/components/partner-filters";
import { PartnersTable } from "@/features/admin/components/partners-table";
import {
  ADMIN_COMPANIES_MAX_PAGE_SIZE,
} from "@/features/admin/constants";
import { useAdminCompaniesQuery } from "@/features/admin/hooks/use-admin-companies";
import { useAdminPartnersQuery } from "@/features/admin/hooks/use-admin-partners";
import { PARTNERS_DEFAULT_PAGE_SIZE } from "@/features/partners/constants";
import { CatalogPagination } from "@/features/catalog/components/catalog-pagination";
import { Button } from "@/shared/ui/button";

const parsePage = (raw: string | null): number => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
};

/**
 * Admin partners list with filters, pagination, and create dialog.
 */
export const PartnersListPage = () => {
  const t = useTranslations("Admin.partners");
  const searchParams = useSearchParams();
  const page = parsePage(searchParams.get("page"));
  const [showCreate, setShowCreate] = useState(false);
  const [filters, setFilters] = useState<{
    type: PartnerCompanyType | "";
    status: PartnerCompanyStatus | "";
    publicationStatus: PublicationStatus | "";
    search: string;
  }>({ type: "", status: "", publicationStatus: "", search: "" });

  const companiesQuery = useAdminCompaniesQuery(1, ADMIN_COMPANIES_MAX_PAGE_SIZE);
  const partnersQuery = useAdminPartnersQuery({
    page,
    pageSize: PARTNERS_DEFAULT_PAGE_SIZE,
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.publicationStatus
      ? { publicationStatus: filters.publicationStatus }
      : {}),
    ...(filters.search.trim() ? { search: filters.search.trim() } : {}),
  });

  if (partnersQuery.isLoading || companiesQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">{t("loading")}</p>;
  }

  if (partnersQuery.isError || !partnersQuery.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t("error")}
      </p>
    );
  }

  const response = partnersQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-ink">{t("title")}</h1>
          <p className="text-sm text-ink-secondary">
            {t("subtitle", { count: response.meta.total })}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => {
            setShowCreate(true);
          }}
        >
          {t("newPartner")}
        </Button>
      </div>

      <PartnerFilters
        type={filters.type}
        status={filters.status}
        publicationStatus={filters.publicationStatus}
        search={filters.search}
        onChange={setFilters}
      />

      {response.data.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t("empty")}</p>
      ) : (
        <PartnersTable partners={response.data} />
      )}

      <CatalogPagination
        page={response.meta.page}
        totalPages={response.meta.totalPages}
        buildHref={(nextPage) =>
          nextPage <= 1 ? "/admin/partners" : `/admin/partners?page=${nextPage}`
        }
        previousLabel={t("pagination.previous")}
        nextLabel={t("pagination.next")}
      />

      {showCreate && companiesQuery.data ? (
        <CreatePartnerPanel
          companies={companiesQuery.data.data}
          onClose={() => {
            setShowCreate(false);
          }}
        />
      ) : null}
    </div>
  );
};
