"use client";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/shared/ui/cn";

type NavItem = {
  href:
    | "/builder"
    | "/builder/projects"
    | "/builder/team"
    | "/builder/company"
    | "/builder/crm"
    | "/builder/scanner"
    | "/builder/readiness"
    | "/builder/analytics";
  key:
    | "dashboard"
    | "projects"
    | "team"
    | "company"
    | "crm"
    | "scanner"
    | "readiness"
    | "analytics";
};

const NAV_ITEMS: NavItem[] = [
  { href: "/builder", key: "dashboard" },
  { href: "/builder/projects", key: "projects" },
  { href: "/builder/team", key: "team" },
  { href: "/builder/company", key: "company" },
  { href: "/builder/crm", key: "crm" },
  { href: "/builder/scanner", key: "scanner" },
  { href: "/builder/readiness", key: "readiness" },
  { href: "/builder/analytics", key: "analytics" },
];

type BuilderNavProps = {
  companyName: string | null;
};

/**
 * Sidebar navigation for the builder portal shell.
 */
export const BuilderNav = ({ companyName }: BuilderNavProps) => {
  const t = useTranslations("Builder.nav");
  const pathname = usePathname();

  return (
    <nav aria-label={t("label")} className="flex flex-col gap-1">
      {companyName ? (
        <p className="mb-3 px-3 text-sm font-semibold text-ink">{companyName}</p>
      ) : null}
      <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-ink-muted">
        {t("section")}
      </p>
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/builder"
            ? pathname === "/builder"
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
