"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { RequestFormPanel } from "@/features/buyer/components/request-form-panel";
import { isNonBuyerStaff } from "@/features/buyer/utils/is-buyer-account";
import { useMeQuery } from "@/features/auth/hooks/use-auth";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { cn } from "@/shared/ui/cn";

type CatalogRequestButtonProps = {
  projectId: string;
  apartmentId?: string | undefined;
  /** Translation key under Catalog.actions */
  labelKey: "requestPrice" | "requestInfo";
  className?: string | undefined;
};

/**
 * Catalog CTA: anonymous → login; buyer → request panel; staff → hidden.
 */
export const CatalogRequestButton = ({
  projectId,
  apartmentId,
  labelKey,
  className,
}: CatalogRequestButtonProps) => {
  const t = useTranslations("Catalog");
  const pathname = usePathname();
  const { data: user, isLoading } = useMeQuery();
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return null;
  }

  if (isNonBuyerStaff(user?.accountType)) {
    return null;
  }

  if (!user) {
    const returnUrl = encodeURIComponent(pathname);
    return (
      <Link
        href={`/auth/login?returnUrl=${returnUrl}`}
        className={cn("inline-flex", className)}
      >
        <Button type="button" className="w-full sm:w-auto">
          {t(`actions.${labelKey}`)}
        </Button>
      </Link>
    );
  }

  if (user.accountType !== "buyer") {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Button
        type="button"
        className="w-full sm:w-auto"
        onClick={() => setOpen(true)}
      >
        {t(`actions.${labelKey}`)}
      </Button>
      {open ? (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="request-panel-title"
        >
          <Card className="w-full max-w-md shadow-sm">
            <h2
              id="request-panel-title"
              className="mb-4 text-lg font-semibold text-ink"
            >
              {t("request.title")}
            </h2>
            <RequestFormPanel
              projectId={projectId}
              apartmentId={apartmentId}
              onClose={() => setOpen(false)}
            />
          </Card>
        </div>
      ) : null}
    </div>
  );
};
