"use client";

import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";

import { TRANSLATION_LOCALES } from "@/features/builder/constants";
import { cn } from "@/shared/ui/cn";

type TranslationTabsProps = {
  children: (locale: (typeof TRANSLATION_LOCALES)[number]) => ReactNode;
};

/**
 * hy / ru / en tab switcher for multilingual form fields.
 */
export const TranslationTabs = ({ children }: TranslationTabsProps) => {
  const t = useTranslations("Builder.locales");
  const [active, setActive] = useState<(typeof TRANSLATION_LOCALES)[number]>(
    "hy",
  );

  return (
    <div className="flex flex-col gap-3">
      <div
        role="tablist"
        aria-label={t("label")}
        className="flex gap-1 border-b border-border"
      >
        {TRANSLATION_LOCALES.map((locale) => (
          <button
            key={locale}
            type="button"
            role="tab"
            aria-selected={active === locale}
            className={cn(
              "px-3 py-2 text-sm font-medium transition-colors",
              active === locale
                ? "border-b-2 border-brand text-brand"
                : "text-ink-secondary hover:text-ink",
            )}
            onClick={() => {
              setActive(locale);
            }}
          >
            {t(locale)}
            {locale === "hy" ? (
              <span className="ml-1 text-danger" aria-hidden>
                *
              </span>
            ) : null}
          </button>
        ))}
      </div>
      <div role="tabpanel">{children(active)}</div>
    </div>
  );
};
