"use client";

import type { ProjectListItem } from "@toonexpo/contracts";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import {
  formatCompactPrice,
  formatPriceRange,
} from "@/features/catalog/utils/format-price";
import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/ui/cn";

type ProjectCardProps = {
  project: ProjectListItem;
  className?: string | undefined;
  featured?: boolean | undefined;
};

/**
 * Catalog project card: cover, name, city, price range, availability.
 */
export const ProjectCard = ({
  project,
  className,
  featured = false,
}: ProjectCardProps) => {
  const t = useTranslations("Catalog");
  const locale = useLocale();
  const location =
    project.locationText ??
    [project.district, project.city].filter(Boolean).join(", ");
  const priceLabel = featured
    ? formatCompactPrice({
        amount: project.minPrice,
        currency: project.priceCurrency,
        locale,
        fromLabel: t("price.from"),
        onRequestLabel: t("price.onRequest"),
      })
    : formatPriceRange({
        minPrice: project.minPrice,
        maxPrice: project.maxPrice,
        currency: project.priceCurrency,
        locale,
        onRequestLabel: t("price.onRequest"),
      });

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-md bg-surface",
        className,
      )}
    >
      <Link
        href={`/projects/${project.id}`}
        className="relative block aspect-[4/3] overflow-hidden rounded-md"
      >
        {project.cover ? (
          <Image
            src={project.cover.fileUrl}
            alt={project.cover.altText ?? project.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-border text-sm text-ink-muted">
            {project.name}
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-pill border border-white/50 bg-white/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink">
          {t("availability.availableCount", {
            count: project.availability.available,
          })}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-brand text-sm font-semibold text-ink">
            <Link
              href={`/projects/${project.id}`}
              className="hover:text-brand"
            >
              {project.name}
            </Link>
          </h3>
          <p className="shrink-0 text-xs font-semibold text-ink">{priceLabel}</p>
        </div>
        <p className="text-[10px] text-ink-muted">
          {project.builder.name}
          {location ? ` · ${location}` : null}
        </p>
        {project.shortDescription ? (
          <p className="line-clamp-2 text-xs text-ink-secondary">
            {project.shortDescription}
          </p>
        ) : null}
        <div className="mt-auto grid grid-cols-3 gap-2 pt-2">
          <AvailabilityTile
            label={t("availability.total")}
            value={project.availability.total}
          />
          <AvailabilityTile
            label={t("availability.available")}
            value={project.availability.available}
          />
          <AvailabilityTile
            label={t("availability.sold")}
            value={project.availability.sold}
          />
        </div>
        <Link
          href={`/projects/${project.id}`}
          className="mt-3 inline-flex h-[34px] items-center justify-center rounded-sm bg-cta-dark text-sm font-medium text-on-dark hover:bg-cta-dark/90"
        >
          {t("actions.details")}
        </Link>
      </div>
    </article>
  );
};

const AvailabilityTile = ({
  label,
  value,
}: {
  label: string;
  value: number;
}) => {
  return (
    <div className="rounded-[10px] bg-background px-1 py-2 text-center">
      <p className="text-[8px] font-bold uppercase tracking-wider text-ink-muted">
        {label}
      </p>
      <p className="text-xs font-semibold text-ink">{value}</p>
    </div>
  );
};
