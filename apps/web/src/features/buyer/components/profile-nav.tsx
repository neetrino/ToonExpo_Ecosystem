"use client";

import { useTranslations } from "next-intl";

import { isBuyerAccount } from "@/features/buyer/utils/is-buyer-account";
import { useMeQuery } from "@/features/auth/hooks/use-auth";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/shared/ui/cn";

type NavKey = "profile" | "qr" | "requests" | "favorites";

type NavItem = {
  href:
    | "/profile"
    | "/profile/qr"
    | "/profile/requests"
    | "/profile/favorites";
  key: NavKey;
  buyerOnly: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/profile", key: "profile", buyerOnly: false },
  { href: "/profile/favorites", key: "favorites", buyerOnly: true },
  { href: "/profile/qr", key: "qr", buyerOnly: true },
  { href: "/profile/requests", key: "requests", buyerOnly: true },
];

const isActive = (pathname: string, href: string): boolean => {
  if (href === "/profile") {
    return pathname === "/profile";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

/**
 * Horizontal cabinet tabs for the buyer profile area (mobile-first).
 */
export const ProfileNav = () => {
  const t = useTranslations("Profile.nav");
  const pathname = usePathname();
  const { data: user } = useMeQuery();
  const showBuyerTabs = isBuyerAccount(user);

  const items = NAV_ITEMS.filter((item) => !item.buyerOnly || showBuyerTabs);

  return (
    <nav
      aria-label={t("label")}
      className="-mx-1 flex gap-1 overflow-x-auto pb-1"
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-pill px-4 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-brand text-on-dark"
                : "bg-surface text-ink-secondary hover:text-ink",
            )}
          >
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
};
