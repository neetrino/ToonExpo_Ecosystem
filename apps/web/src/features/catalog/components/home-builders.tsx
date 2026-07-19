import type { BuilderSummary } from "@toonexpo/contracts";
import { getTranslations } from "next-intl/server";

import { BuilderCard } from "@/features/catalog/components/builder-card";
import { Link } from "@/i18n/navigation";

type HomeBuildersProps = {
  builders: BuilderSummary[];
};

/**
 * Home builders strip with link to full builders page.
 */
export const HomeBuilders = async ({ builders }: HomeBuildersProps) => {
  const t = await getTranslations("HomePage");

  return (
    <section className="bg-surface">
      <div className="mx-auto w-full max-w-content px-6 py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              {t("builders.eyebrow")}
            </p>
            <h2 className="mt-2 text-[clamp(1.5rem,4vw,1.75rem)] font-bold tracking-tight text-ink">
              {t("builders.title")}
            </h2>
          </div>
          <Link
            href="/builders"
            className="text-[13px] font-semibold text-ink hover:text-brand"
          >
            {t("builders.viewAll")}
          </Link>
        </div>

        {builders.length === 0 ? (
          <p className="text-sm text-ink-secondary">{t("builders.empty")}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {builders.map((builder) => (
              <BuilderCard key={builder.id} builder={builder} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
