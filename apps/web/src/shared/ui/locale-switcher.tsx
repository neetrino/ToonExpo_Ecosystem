"use client";

import { useLocale, useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/shared/ui/cn";

const LOCALE_LABELS: Record<string, string> = {
  hy: "Հայ",
  ru: "Рус",
  en: "Eng",
};

/**
 * Client locale switcher for the public web shell.
 */
export const LocaleSwitcher = () => {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-2" role="group" aria-label={t("languageLabel")}>
      <span className="text-sm text-ink-secondary">{t("languageLabel")}</span>
      <div className="flex gap-1">
        {routing.locales.map((code) => (
          <button
            key={code}
            type="button"
            className={cn(
              "rounded-pill px-2.5 py-1 text-sm font-medium transition-colors",
              code === locale
                ? "bg-cta-dark text-on-dark"
                : "bg-surface text-ink-secondary hover:bg-border",
            )}
            onClick={() => {
              router.replace(pathname, { locale: code });
            }}
          >
            {LOCALE_LABELS[code] ?? code}
          </button>
        ))}
      </div>
    </div>
  );
};
