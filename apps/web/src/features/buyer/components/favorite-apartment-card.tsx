"use client";

import type { FavoriteApartmentCard } from "@toonexpo/contracts";
import { useLocale, useTranslations } from "next-intl";

import { formatCatalogPrice } from "@/features/catalog/utils/format-price";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

type FavoriteApartmentCardProps = {
  apartment: FavoriteApartmentCard;
  onRemove: () => void;
  removing?: boolean | undefined;
};

/**
 * Compact apartment row for the buyer favorites list.
 */
export const FavoriteApartmentCardView = ({
  apartment,
  onRemove,
  removing = false,
}: FavoriteApartmentCardProps) => {
  const t = useTranslations("Favorites");
  const tCatalog = useTranslations("Catalog");
  const locale = useLocale();
  const price = formatCatalogPrice({
    amount: apartment.price,
    currency: apartment.priceCurrency,
    locale,
    priceVisibility: apartment.priceVisibility,
    onRequestLabel: tCatalog("price.onRequest"),
    signInLabel: tCatalog("price.signInToSee"),
  });

  return (
    <Card className="flex flex-col gap-3 !p-4 shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Link
            href={`/apartments/${apartment.id}`}
            className="text-sm font-semibold text-ink hover:text-brand"
          >
            {t("apartmentTitle", {
              number: apartment.number,
              project: apartment.project.name,
            })}
          </Link>
          <p className="text-xs text-ink-secondary">{apartment.builder.name}</p>
        </div>
        <span className="shrink-0 rounded-sm bg-background px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-ink-secondary">
          {tCatalog(`status.${apartment.salesStatus}`)}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-2 text-xs text-ink-secondary sm:grid-cols-3">
        {apartment.rooms != null ? (
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              {tCatalog("apartment.roomsLabel")}
            </dt>
            <dd className="mt-0.5 font-medium text-ink">{apartment.rooms}</dd>
          </div>
        ) : null}
        {apartment.areaTotal != null ? (
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              {tCatalog("apartment.areaLabel")}
            </dt>
            <dd className="mt-0.5 font-medium text-ink">
              {tCatalog("apartment.area", { area: apartment.areaTotal })}
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
            {t("priceLabel")}
          </dt>
          <dd className="mt-0.5 font-medium text-ink">{price}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/projects/${apartment.project.id}`}
          className="text-xs font-semibold text-brand hover:underline"
        >
          {tCatalog("actions.viewProject")}
        </Link>
        <Button
          type="button"
          variant="ghost"
          className="h-8 px-2 text-xs text-danger hover:text-danger"
          disabled={removing}
          onClick={onRemove}
        >
          {t("removeButton")}
        </Button>
      </div>
    </Card>
  );
};
