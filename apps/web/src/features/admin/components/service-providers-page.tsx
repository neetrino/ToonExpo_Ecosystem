"use client";

import type {
  AdminServiceProviderItem,
  ServiceProviderCategoryItem,
} from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { ServiceProviderCategoryForm } from "@/features/admin/components/service-provider-category-form";
import { ServiceProviderForm } from "@/features/admin/components/service-provider-form";
import type { ServiceProviderFormValues } from "@/features/admin/schemas/service-provider.schema";
import {
  useAdminServiceProviderCategoriesQuery,
  useAdminServiceProvidersQuery,
  useCreateServiceProviderMutation,
  useDeleteServiceProviderCategoryMutation,
  useDeleteServiceProviderMutation,
  useUpdateServiceProviderMutation,
} from "@/features/admin/hooks/use-admin-service-providers";
import {
  toCreateServiceProviderBody,
  toServiceProviderFormValues,
  toUpdateServiceProviderBody,
} from "@/features/admin/utils/service-provider-mappers";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

/**
 * Admin service provider directory: categories + providers CRUD.
 */
export const ServiceProvidersPage = () => {
  const t = useTranslations("Admin.serviceProviders");
  const categoriesQuery = useAdminServiceProviderCategoriesQuery();
  const [providerFilters, setProviderFilters] = useState<{
    search: string;
    active: "" | "true" | "false";
    categoryId: string;
  }>({ search: "", active: "", categoryId: "" });

  const providersQuery = useAdminServiceProvidersQuery({
    ...(providerFilters.search ? { search: providerFilters.search } : {}),
    ...(providerFilters.categoryId
      ? { categoryId: providerFilters.categoryId }
      : {}),
    ...(providerFilters.active === "true" ? { active: true } : {}),
    ...(providerFilters.active === "false" ? { active: false } : {}),
  });

  const [editingCategory, setEditingCategory] =
    useState<ServiceProviderCategoryItem | null>(null);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [editingProvider, setEditingProvider] =
    useState<AdminServiceProviderItem | null>(null);
  const [creatingProvider, setCreatingProvider] = useState(false);

  const createProviderMutation = useCreateServiceProviderMutation();
  const updateProviderMutation = useUpdateServiceProviderMutation();
  const deleteProviderMutation = useDeleteServiceProviderMutation();
  const deleteCategoryMutation = useDeleteServiceProviderCategoryMutation();

  if (categoriesQuery.isLoading || providersQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">{t("loading")}</p>;
  }

  if (
    categoriesQuery.isError ||
    !categoriesQuery.data ||
    providersQuery.isError ||
    !providersQuery.data
  ) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t("error")}
      </p>
    );
  }

  const categories = categoriesQuery.data.data;
  const providers = providersQuery.data.data;
  const busy =
    createProviderMutation.isPending ||
    updateProviderMutation.isPending ||
    deleteProviderMutation.isPending ||
    deleteCategoryMutation.isPending;

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-ink">{t("title")}</h1>
        <p className="text-sm text-ink-secondary">{t("subtitle")}</p>
      </header>

      <CategoriesSection
        categories={categories}
        creating={creatingCategory}
        editing={editingCategory}
        onCreate={() => {
          setCreatingCategory(true);
          setEditingCategory(null);
        }}
        onEdit={(category) => {
          setEditingCategory(category);
          setCreatingCategory(false);
        }}
        onDelete={(id) => {
          void deleteCategoryMutation.mutateAsync(id);
        }}
        onDone={() => {
          setCreatingCategory(false);
          setEditingCategory(null);
        }}
        busy={busy}
      />

      <ProvidersSection
        categories={categories}
        providers={providers}
        filters={providerFilters}
        onFiltersChange={setProviderFilters}
        creating={creatingProvider}
        editing={editingProvider}
        onCreate={() => {
          setCreatingProvider(true);
          setEditingProvider(null);
        }}
        onEdit={(provider) => {
          setEditingProvider(provider);
          setCreatingProvider(false);
        }}
        onDelete={(id) => {
          void deleteProviderMutation.mutateAsync(id);
        }}
        onDone={() => {
          setCreatingProvider(false);
          setEditingProvider(null);
        }}
        onCreateSubmit={async (values) => {
          await createProviderMutation.mutateAsync(toCreateServiceProviderBody(values));
        }}
        onUpdateSubmit={async (id, values) => {
          await updateProviderMutation.mutateAsync({
            id,
            body: toUpdateServiceProviderBody(values),
          });
        }}
        busy={busy}
      />
    </div>
  );
};

type CategoriesSectionProps = {
  categories: ServiceProviderCategoryItem[];
  creating: boolean;
  editing: ServiceProviderCategoryItem | null;
  onCreate: () => void;
  onEdit: (category: ServiceProviderCategoryItem) => void;
  onDelete: (id: string) => void;
  onDone: () => void;
  busy: boolean;
};

const CategoriesSection = ({
  categories,
  creating,
  editing,
  onCreate,
  onEdit,
  onDelete,
  onDone,
  busy,
}: CategoriesSectionProps) => {
  const t = useTranslations("Admin.serviceProviders.categories");

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">{t("title")}</h2>
        <Button type="button" size="sm" variant="secondary" onClick={onCreate}>
          {t("newCategory")}
        </Button>
      </div>

      {creating ? (
        <Card className="max-w-xl">
          <ServiceProviderCategoryForm onDone={onDone} />
        </Card>
      ) : null}

      {editing ? (
        <Card className="max-w-xl">
          <ServiceProviderCategoryForm category={editing} onDone={onDone} />
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
                <th className="px-3 py-2 font-medium">{t("columns.sort")}</th>
                <th className="px-3 py-2 font-medium">{t("columns.active")}</th>
                <th className="px-3 py-2 font-medium">{t("columns.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-t border-border">
                  <td className="px-3 py-2.5 font-medium text-ink">{category.name}</td>
                  <td className="px-3 py-2.5 text-ink-secondary">{category.sortOrder}</td>
                  <td className="px-3 py-2.5 text-ink-secondary">
                    {category.active ? t("activeYes") : t("activeNo")}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="text-sm font-medium text-brand hover:underline"
                        onClick={() => {
                          onEdit(category);
                        }}
                      >
                        {t("edit")}
                      </button>
                      <button
                        type="button"
                        className="text-sm font-medium text-danger hover:underline"
                        disabled={busy}
                        onClick={() => {
                          onDelete(category.id);
                        }}
                      >
                        {t("delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

type ProvidersSectionProps = {
  categories: ServiceProviderCategoryItem[];
  providers: AdminServiceProviderItem[];
  filters: { search: string; active: "" | "true" | "false"; categoryId: string };
  onFiltersChange: (filters: {
    search: string;
    active: "" | "true" | "false";
    categoryId: string;
  }) => void;
  creating: boolean;
  editing: AdminServiceProviderItem | null;
  onCreate: () => void;
  onEdit: (provider: AdminServiceProviderItem) => void;
  onDelete: (id: string) => void;
  onDone: () => void;
  onCreateSubmit: (values: ServiceProviderFormValues) => Promise<void>;
  onUpdateSubmit: (id: string, values: ServiceProviderFormValues) => Promise<void>;
  busy: boolean;
};

const ProvidersSection = ({
  categories,
  providers,
  filters,
  onFiltersChange,
  creating,
  editing,
  onCreate,
  onEdit,
  onDelete,
  onDone,
  onCreateSubmit,
  onUpdateSubmit,
  busy,
}: ProvidersSectionProps) => {
  const t = useTranslations("Admin.serviceProviders.providers");
  const emptyDefaults = {
    name: "",
    providerType: "company" as const,
    description: "",
    services: "",
    phone: "",
    email: "",
    website: "",
    socialFacebook: "",
    socialInstagram: "",
    socialLinkedin: "",
    internalNotes: "",
    active: true,
    categoryIds: [] as string[],
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">{t("title")}</h2>
        <Button type="button" size="sm" variant="secondary" onClick={onCreate}>
          {t("newProvider")}
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          className="h-10 rounded-sm border border-border bg-background px-3 text-sm"
          placeholder={t("filters.searchPlaceholder")}
          value={filters.search}
          onChange={(event) => {
            onFiltersChange({ ...filters, search: event.target.value });
          }}
        />
        <select
          className="h-10 rounded-sm border border-border bg-background px-3 text-sm"
          value={filters.categoryId}
          onChange={(event) => {
            onFiltersChange({ ...filters, categoryId: event.target.value });
          }}
        >
          <option value="">{t("filters.allCategories")}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          className="h-10 rounded-sm border border-border bg-background px-3 text-sm"
          value={filters.active}
          onChange={(event) => {
            onFiltersChange({
              ...filters,
              active: event.target.value as "" | "true" | "false",
            });
          }}
        >
          <option value="">{t("filters.allActive")}</option>
          <option value="true">{t("filters.active")}</option>
          <option value="false">{t("filters.inactive")}</option>
        </select>
      </div>

      {creating ? (
        <Card className="max-w-2xl">
          <ServiceProviderForm
            categories={categories}
            defaultValues={emptyDefaults}
            submitLabel={t("create")}
            isBusy={busy}
            onCancel={onDone}
            onSubmit={async (values) => {
              await onCreateSubmit(values);
              onDone();
            }}
          />
        </Card>
      ) : null}

      {editing ? (
        <Card className="max-w-2xl">
          <ServiceProviderForm
            categories={categories}
            defaultValues={toServiceProviderFormValues(editing)}
            submitLabel={t("save")}
            isBusy={busy}
            onCancel={onDone}
            onSubmit={async (values) => {
              await onUpdateSubmit(editing.id, values);
              onDone();
            }}
          />
        </Card>
      ) : null}

      {providers.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t("empty")}</p>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-border">
          <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-3 py-2 font-medium">{t("columns.name")}</th>
                <th className="px-3 py-2 font-medium">{t("columns.type")}</th>
                <th className="px-3 py-2 font-medium">{t("columns.categories")}</th>
                <th className="px-3 py-2 font-medium">{t("columns.active")}</th>
                <th className="px-3 py-2 font-medium">{t("columns.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((provider) => (
                <tr key={provider.id} className="border-t border-border">
                  <td className="px-3 py-2.5 font-medium text-ink">{provider.name}</td>
                  <td className="px-3 py-2.5 text-ink-secondary">
                    {t(`form.types.${provider.providerType}`)}
                  </td>
                  <td className="px-3 py-2.5 text-ink-secondary">
                    {provider.categories.map((c) => c.name).join(", ") || "—"}
                  </td>
                  <td className="px-3 py-2.5 text-ink-secondary">
                    {provider.active ? t("activeYes") : t("activeNo")}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="text-sm font-medium text-brand hover:underline"
                        onClick={() => {
                          onEdit(provider);
                        }}
                      >
                        {t("edit")}
                      </button>
                      <button
                        type="button"
                        className="text-sm font-medium text-danger hover:underline"
                        disabled={busy}
                        onClick={() => {
                          onDelete(provider.id);
                        }}
                      >
                        {t("delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
