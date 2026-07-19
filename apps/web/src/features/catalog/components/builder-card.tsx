"use client";

import type { BuilderSummary } from "@toonexpo/contracts";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/ui/cn";

type BuilderCardProps = {
  builder: BuilderSummary;
  className?: string | undefined;
};

/**
 * Builder summary card with logo and published project count.
 */
export const BuilderCard = ({ builder, className }: BuilderCardProps) => {
  const t = useTranslations("Catalog");

  return (
    <article
      className={cn(
        "flex items-center gap-4 rounded-md bg-surface p-4",
        className,
      )}
    >
      <div className="relative size-14 shrink-0 overflow-hidden rounded-sm bg-background">
        {builder.logoUrl ? (
          <Image
            src={builder.logoUrl}
            alt={builder.name}
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : (
          <div className="flex size-full items-center justify-center font-brand text-sm font-bold text-brand">
            {builder.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <Link
          href={`/builders/${builder.id}`}
          className="block truncate font-brand text-sm font-semibold text-ink hover:text-brand"
        >
          {builder.name}
        </Link>
        {builder.description ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-ink-secondary">
            {builder.description}
          </p>
        ) : null}
        <p className="text-xs text-ink-secondary">
          {t("builders.projectCount", {
            count: builder.publishedProjectCount,
          })}
        </p>
      </div>
      <Link
        href={`/projects?builderId=${encodeURIComponent(builder.id)}`}
        className="shrink-0 text-xs font-semibold text-ink hover:text-brand"
      >
        {t("actions.viewProjects")}
      </Link>
    </article>
  );
};
