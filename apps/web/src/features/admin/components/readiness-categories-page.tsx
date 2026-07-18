"use client";

import type { ReadinessCategoryItem } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { ReadinessCategoryForm } from "@/features/admin/components/readiness-category-form";
import { useAdminReadinessCategoriesQuery } from "@/features/admin/hooks/use-admin-readiness";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

/**
 * Admin readiness categories list with inline create/edit panel.
 */
export const ReadinessCategoriesPage = () => {
  const t = useTranslations("Admin.readiness.categories");
  const query = useAdminReadinessCategoriesQuery();
  const [editing, setEditing] = useState<ReadinessCategoryItem | null>(null);
  const [creating, setCreating] = useState(false);

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

  const categories = query.data.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-ink">{t("title")}</h1>
          <p className="text-sm text-ink-secondary">{t("subtitle")}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => {
            setCreating(true);
            setEditing(null);
          }}
        >
          {t("newCategory")}
        </Button>
      </div>

      {creating ? (
        <Card className="max-w-xl">
          <h2 className="mb-4 text-base font-semibold text-ink">
            {t("createTitle")}
          </h2>
          <ReadinessCategoryForm
            onDone={() => {
              setCreating(false);
            }}
          />
        </Card>
      ) : null}

      {editing ? (
        <Card className="max-w-xl">
          <h2 className="mb-4 text-base font-semibold text-ink">
            {t("editTitle", { name: editing.name })}
          </h2>
          <ReadinessCategoryForm
            category={editing}
            onDone={() => {
              setEditing(null);
            }}
          />
        </Card>
      ) : null}

      {categories.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t("empty")}</p>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-border">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-3 py-2 font-medium">{t("columns.name")}</th>
                <th className="px-3 py-2 font-medium">{t("columns.weight")}</th>
                <th className="px-3 py-2 font-medium">{t("columns.sort")}</th>
                <th className="px-3 py-2 font-medium">{t("columns.active")}</th>
                <th className="px-3 py-2 font-medium">{t("columns.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="border-t border-border hover:bg-surface/60"
                >
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-ink">{category.name}</p>
                    {category.description ? (
                      <p className="mt-0.5 text-xs text-ink-muted">
                        {category.description}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-3 py-2.5 text-ink-secondary">
                    {category.weight ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 text-ink-secondary">
                    {category.sortOrder}
                  </td>
                  <td className="px-3 py-2.5 text-ink-secondary">
                    {category.active ? t("activeYes") : t("activeNo")}
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      className="text-sm font-medium text-brand hover:underline"
                      onClick={() => {
                        setEditing(category);
                        setCreating(false);
                      }}
                    >
                      {t("edit")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
