"use client";

import { useTranslations } from "next-intl";

import { LogoutButton } from "@/features/auth/components/logout-button";
import { useMeQuery } from "@/features/auth/hooks/use-auth";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { LocaleSwitcher } from "@/shared/ui/locale-switcher";
import { cn } from "@/shared/ui/cn";

type SiteHeaderProps = {
  className?: string | undefined;
};

/**
 * Shared top nav: ToonExpo wordmark, locale switcher, auth actions.
 */
export const SiteHeader = ({ className }: SiteHeaderProps) => {
  const t = useTranslations("Nav");
  const { data: user, isLoading } = useMeQuery();

  return (
    <header
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 border-b border-border bg-background px-6 py-4",
        className,
      )}
    >
      <Link href="/" className="font-brand text-xl font-bold tracking-tight text-ink">
        <span>TOON</span>
        <span className="text-brand-secondary">EXPO</span>
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <LocaleSwitcher />
        {isLoading ? (
          <span className="text-sm text-ink-muted">{t("loading")}</span>
        ) : user ? (
          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="max-w-40 truncate text-sm font-medium text-ink hover:text-brand"
            >
              {user.name}
            </Link>
            <LogoutButton />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                {t("login")}
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="secondary" size="sm">
                {t("register")}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
