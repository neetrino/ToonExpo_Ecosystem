"use client";

import type { PublicPartnerListItem } from "@toonexpo/contracts";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { FeaturedBadge } from "@/features/partners/components/partner-badges";
import { PartnerTypeLabel } from "@/features/partners/components/partner-type-label";
import { Link } from "@/i18n/navigation";
import { cn } from "@/shared/ui/cn";

type PartnerCardProps = {
  partner: PublicPartnerListItem;
  className?: string | undefined;
};

/**
 * Public partner card with logo placeholder, type, and short description.
 */
export const PartnerCard = ({ partner, className }: PartnerCardProps) => {
  const t = useTranslations("Catalog.partnersPage");

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-md bg-surface",
        partner.featured && "ring-1 ring-brand/30",
        className,
      )}
    >
      <div className="relative flex aspect-[3/2] items-center justify-center bg-background">
        {partner.logoUrl ? (
          <Image
            src={partner.logoUrl}
            alt={partner.name}
            fill
            className="object-contain p-6"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex size-16 items-center justify-center rounded-sm bg-surface font-brand text-lg font-bold text-brand">
            {partner.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        {partner.featured ? (
          <span className="absolute left-3 top-3">
            <FeaturedBadge featured />
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-brand text-sm font-semibold text-ink">
            {partner.name}
          </h3>
        </div>
        <p className="text-xs text-ink-muted">
          <PartnerTypeLabel type={partner.type} />
        </p>
        {partner.shortDescription ? (
          <p className="line-clamp-3 text-xs text-ink-secondary">
            {partner.shortDescription}
          </p>
        ) : null}
        <Link
          href={`/partners/${partner.slug}`}
          className="mt-auto inline-flex h-[34px] items-center justify-center rounded-sm bg-cta-dark text-sm font-medium text-on-dark hover:bg-cta-dark/90"
        >
          {t("actions.details")}
        </Link>
      </div>
    </article>
  );
};
