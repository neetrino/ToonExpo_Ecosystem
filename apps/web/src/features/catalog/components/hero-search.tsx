"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";

import { useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/ui/cn";

type HeroSearchProps = {
  className?: string | undefined;
};

/**
 * Variant A hero search: navigates to projects with optional city filter.
 */
export const HeroSearch = ({ className }: HeroSearchProps) => {
  const t = useTranslations("HomePage");
  const router = useRouter();
  const [query, setQuery] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length > 0) {
      router.push(`/projects?city=${encodeURIComponent(trimmed)}`);
      return;
    }
    router.push("/projects");
  };

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "w-full max-w-[799px] rounded-md bg-background p-3.5 shadow-md",
        className,
      )}
    >
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-stretch">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">{t("hero.searchLabel")}</span>
          <input
            type="search"
            name="city"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            placeholder={t("hero.searchPlaceholder")}
            className="h-11 w-full rounded-sm bg-surface-input px-4 text-[13px] text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
          />
        </label>
        <Button type="submit" variant="secondary" className="h-11 rounded-sm px-6">
          {t("hero.search")}
        </Button>
      </div>
    </form>
  );
};
