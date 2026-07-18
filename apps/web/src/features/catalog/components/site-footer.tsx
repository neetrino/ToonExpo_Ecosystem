import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

/**
 * Public site footer (Variant A: light columns + marketplace/company links).
 */
export const SiteFooter = async () => {
  const t = await getTranslations("Footer");

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid w-full max-w-content gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <p className="font-brand text-lg font-extrabold tracking-tight text-ink">
            <span>TOON</span>
            <span className="text-brand-secondary">EXPO</span>
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-ink-secondary">
            {t("tagline")}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink">
            {t("marketplace")}
          </p>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-ink-secondary">
            <li>
              <Link href="/projects" className="hover:text-ink">
                {t("links.projects")}
              </Link>
            </li>
            <li>
              <Link href="/builders" className="hover:text-ink">
                {t("links.builders")}
              </Link>
            </li>
            <li>
              <Link href="/partners" className="hover:text-ink">
                {t("links.partners")}
              </Link>
            </li>
            <li>
              <Link href="/mortgage" className="hover:text-ink">
                {t("links.mortgage")}
              </Link>
            </li>
            <li>
              <Link href="/expo" className="hover:text-ink">
                {t("links.expo")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink">
            {t("company")}
          </p>
          <ul className="mt-4 flex flex-col gap-3 text-sm text-ink-secondary">
            <li>
              <Link href="/auth/register" className="hover:text-ink">
                {t("links.register")}
              </Link>
            </li>
            <li>
              <Link href="/auth/login" className="hover:text-ink">
                {t("links.login")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-content flex-col gap-2 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-muted">{t("trust")}</p>
          <p className="text-[10px] font-medium uppercase tracking-widest text-ink-muted">
            {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};
