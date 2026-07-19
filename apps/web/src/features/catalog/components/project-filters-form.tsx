"use client";

import { useTranslations } from "next-intl";

import type { ProjectFilterParams } from "@/features/catalog/utils/project-filters";
import { Button } from "@/shared/ui/button";

type ProjectFiltersFormProps = {
  filters: ProjectFilterParams;
};

/**
 * SSR-friendly GET filters for the projects catalog (shareable URL params).
 */
export const ProjectFiltersForm = ({ filters }: ProjectFiltersFormProps) => {
  const t = useTranslations("Catalog");

  return (
    <form
      method="get"
      className="grid gap-3 rounded-md bg-surface p-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-secondary">
        {t("filters.rooms")}
        <select
          name="rooms"
          defaultValue={filters.rooms != null ? String(filters.rooms) : ""}
          className="h-11 rounded-sm border border-border bg-background px-3 text-sm text-ink"
        >
          <option value="">{t("filters.any")}</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4+</option>
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-secondary">
        {t("filters.minPrice")}
        <input
          type="number"
          name="minPrice"
          min={0}
          defaultValue={filters.minPrice ?? ""}
          placeholder={t("filters.pricePlaceholder")}
          className="h-11 rounded-sm border border-border bg-background px-3 text-sm text-ink"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-secondary">
        {t("filters.maxPrice")}
        <input
          type="number"
          name="maxPrice"
          min={0}
          defaultValue={filters.maxPrice ?? ""}
          placeholder={t("filters.pricePlaceholder")}
          className="h-11 rounded-sm border border-border bg-background px-3 text-sm text-ink"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-secondary">
        {t("filters.salesStatus")}
        <select
          name="salesStatus"
          defaultValue={filters.salesStatus ?? ""}
          className="h-11 rounded-sm border border-border bg-background px-3 text-sm text-ink"
        >
          <option value="">{t("filters.any")}</option>
          <option value="available">{t("status.available")}</option>
          <option value="reserved">{t("status.reserved")}</option>
          <option value="sold">{t("status.sold")}</option>
        </select>
      </label>

      <div className="flex items-end gap-2">
        {filters.city ? (
          <input type="hidden" name="city" value={filters.city} />
        ) : null}
        {filters.builderId ? (
          <input type="hidden" name="builderId" value={filters.builderId} />
        ) : null}
        <Button type="submit" variant="secondary" className="h-11 w-full rounded-sm">
          {t("filters.apply")}
        </Button>
      </div>
    </form>
  );
};
