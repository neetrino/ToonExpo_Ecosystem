"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/ui/cn";

type RequestPriceButtonProps = {
  className?: string | undefined;
};

/**
 * Placeholder CTA for lead requests (Sprint 3). Disabled with coming-soon tooltip.
 */
export const RequestPriceButton = ({ className }: RequestPriceButtonProps) => {
  const t = useTranslations("Catalog");

  return (
    <span
      className={cn("inline-flex", className)}
      title={t("actions.comingSoon")}
    >
      <Button type="button" disabled className="w-full sm:w-auto">
        {t("actions.requestPrice")}
      </Button>
    </span>
  );
};
