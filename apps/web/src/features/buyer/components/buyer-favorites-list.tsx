"use client";

import { useLocale, useTranslations } from "next-intl";

import { FavoriteApartmentCardView } from "@/features/buyer/components/favorite-apartment-card";
import {
  useBuyerFavoritesQuery,
  useRemoveFavoriteMutation,
} from "@/features/buyer/hooks/use-favorites";
import { ProjectCard } from "@/features/catalog/components/project-card";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";

/**
 * Buyer favorites list with project cards and compact apartment rows.
 */
export const BuyerFavoritesList = () => {
  const t = useTranslations("Profile.favorites");
  const locale = useLocale();
  const query = useBuyerFavoritesQuery(locale);
  const removeMutation = useRemoveFavoriteMutation();

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

  const items = query.data?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-4 rounded-md bg-surface p-6 text-center">
        <p className="text-sm text-ink-secondary">{t("empty")}</p>
        <Link
          href="/projects"
          className="text-sm font-semibold text-brand hover:underline"
        >
          {t("browseCatalog")}
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => (
        <li key={item.id}>
          {item.targetType === "project" ? (
            <div className="flex flex-col gap-3">
              <ProjectCard project={item.project} />
              <Button
                type="button"
                variant="ghost"
                className="self-start px-0 text-xs text-danger hover:text-danger"
                disabled={removeMutation.isPending}
                onClick={() =>
                  removeMutation.mutate({
                    targetType: "project",
                    targetId: item.targetId,
                  })
                }
              >
                {t("removeButton")}
              </Button>
            </div>
          ) : (
            <FavoriteApartmentCardView
              apartment={item.apartment}
              removing={removeMutation.isPending}
              onRemove={() =>
                removeMutation.mutate({
                  targetType: "apartment",
                  targetId: item.targetId,
                })
              }
            />
          )}
        </li>
      ))}
    </ul>
  );
};
