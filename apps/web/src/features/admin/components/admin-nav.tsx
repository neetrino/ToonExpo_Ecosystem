"use client";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/shared/ui/cn";

const NAV_ITEMS = [
  { href: "/admin/companies", key: "companies" as const },
  { href: "/admin/partners", key: "partners" as const },
  { href: "/admin/readiness", key: "readiness" as const },
  { href: "/admin/readiness/categories", key: "readinessCategories" as const },
];

/**
 * Compact sidebar nav for the platform admin area.
 */
export const AdminNav = () => {
  const t = useTranslations("Admin.nav");
  const pathname = usePathname();

  return (
    <nav aria-label={t("label")} className="flex flex-col gap-1">
      <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-ink-muted">
        {t("section")}
      </p>
      {NAV_ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
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
