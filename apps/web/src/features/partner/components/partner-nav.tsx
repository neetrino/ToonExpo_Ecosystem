"use client";

import type { PartnerCompanyType } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/shared/ui/cn";

type PartnerNavProps = {
  companyName: string | null;
  partnerName: string | null;
  partnerType: PartnerCompanyType;
};

const BASE_NAV_ITEMS = [
  { href: "/partner", key: "profile" as const },
  { href: "/partner/offers", key: "offers" as const },
];

const BANK_NAV_ITEM = { href: "/partner/bank-offers", key: "bankOffers" as const };

/**
 * Sidebar navigation for the partner portal shell.
 */
export const PartnerNav = ({
  companyName,
  partnerName,
  partnerType,
}: PartnerNavProps) => {
  const t = useTranslations("Partner.nav");
  const pathname = usePathname();

  const navItems =
    partnerType === "bank"
      ? [...BASE_NAV_ITEMS, BANK_NAV_ITEM]
      : BASE_NAV_ITEMS;

  return (
    <nav aria-label={t("label")} className="flex flex-col gap-1">
      {companyName ? (
        <p className="mb-1 px-3 text-sm font-semibold text-ink">{companyName}</p>
      ) : null}
      {partnerName ? (
        <p className="mb-3 px-3 text-xs text-ink-secondary">{partnerName}</p>
      ) : null}
      <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-ink-muted">
        {t("section")}
      </p>
      {navItems.map((item) => {
        const active =
          item.href === "/partner"
            ? pathname === "/partner"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-sm px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-surface text-brand"
                : "text-ink-secondary hover:bg-surface hover:text-ink",
            )}
          >
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
};
