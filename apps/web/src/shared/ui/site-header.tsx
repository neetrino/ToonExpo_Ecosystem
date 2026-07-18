"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { LogoutButton } from "@/features/auth/components/logout-button";
import { useMeQuery } from "@/features/auth/hooks/use-auth";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { LocaleSwitcher } from "@/shared/ui/locale-switcher";
import { cn } from "@/shared/ui/cn";

type SiteHeaderProps = {
  className?: string | undefined;
  /** Transparent over hero imagery (Variant A). */
  variant?: "solid" | "transparent" | undefined;
};

/**
 * Shared top nav: logo, catalog links, locale switcher, auth actions.
 */
export const SiteHeader = ({
  className,
  variant = "solid",
}: SiteHeaderProps) => {
  const t = useTranslations("Nav");
  const { data: user, isLoading } = useMeQuery();
  const [menuOpen, setMenuOpen] = useState(false);
  const isTransparent = variant === "transparent";

  return (
    <header
      className={cn(
        "relative z-20 w-full",
        isTransparent
          ? "bg-transparent text-on-dark"
          : "border-b border-border bg-background text-ink",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-content items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className={cn(
            "font-brand text-lg font-extrabold tracking-tight",
            isTransparent ? "text-on-dark" : "text-ink",
          )}
        >
          <span>TOON</span>
          <span className="text-brand">EXPO</span>
        </Link>

        <nav
          className={cn(
            "hidden items-center gap-7 text-[13px] md:flex",
            isTransparent ? "text-on-dark" : "text-ink",
          )}
          aria-label={t("main")}
        >
          <Link href="/projects" className="hover:opacity-80">
            {t("projects")}
          </Link>
          <Link href="/builders" className="hover:opacity-80">
            {t("builders")}
          </Link>
          <Link href="/partners" className="hover:opacity-80">
            {t("partners")}
          </Link>
          <Link href="/mortgage" className="hover:opacity-80">
            {t("mortgage")}
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className={cn(isTransparent && "[&_button]:text-on-dark")}>
            <LocaleSwitcher />
          </div>
          {isLoading ? (
            <span className="text-sm opacity-70">{t("loading")}</span>
          ) : user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className={cn(
                  "hidden max-w-32 truncate text-sm font-medium sm:inline",
                  isTransparent
                    ? "text-on-dark hover:opacity-80"
                    : "text-ink hover:text-brand",
                )}
              >
                {user.name}
              </Link>
              <LogoutButton />
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    isTransparent &&
                      "border-transparent text-on-dark hover:bg-white/10",
                  )}
                >
                  {t("login")}
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button
                  size="sm"
                  className={cn(
                    "rounded-sm",
                    isTransparent
                      ? "bg-on-dark text-ink hover:bg-on-dark/90"
                      : "bg-background text-ink border border-border-strong hover:bg-surface",
                  )}
                >
                  {t("register")}
                </Button>
              </Link>
            </div>
          )}

          <button
            type="button"
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-sm border text-sm md:hidden",
              isTransparent
                ? "border-white/40 text-on-dark"
                : "border-border text-ink",
            )}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => {
              setMenuOpen((open) => !open);
            }}
          >
            <span className="sr-only">{t("menu")}</span>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div
          id="mobile-nav"
          className="border-t border-border/40 bg-background px-6 py-4 text-ink md:hidden"
        >
          <nav className="flex flex-col gap-3 text-sm" aria-label={t("main")}>
            <Link href="/projects" onClick={() => setMenuOpen(false)}>
              {t("projects")}
            </Link>
            <Link href="/builders" onClick={() => setMenuOpen(false)}>
              {t("builders")}
            </Link>
            <Link href="/partners" onClick={() => setMenuOpen(false)}>
              {t("partners")}
            </Link>
            <Link href="/mortgage" onClick={() => setMenuOpen(false)}>
              {t("mortgage")}
            </Link>
            {!user ? (
              <>
                <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                  {t("login")}
                </Link>
                <Link href="/auth/register" onClick={() => setMenuOpen(false)}>
                  {t("register")}
                </Link>
              </>
            ) : (
              <Link href="/profile" onClick={() => setMenuOpen(false)}>
                {user.name}
              </Link>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
};
