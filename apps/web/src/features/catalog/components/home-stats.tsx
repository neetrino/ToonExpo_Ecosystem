import type { ProjectListItem } from "@toonexpo/contracts";
import { getTranslations } from "next-intl/server";

type HomeStatsProps = {
  projects: ProjectListItem[];
  builderCount: number;
};

/**
 * Floating market-pulse stats bar under the hero (Variant A).
 * Values derived from live catalog totals, not mock Figma numbers.
 */
export const HomeStats = async ({ projects, builderCount }: HomeStatsProps) => {
  const t = await getTranslations("HomePage");
  const listingCount = projects.reduce(
    (sum, project) => sum + project.availability.total,
    0,
  );
  const availableCount = projects.reduce(
    (sum, project) => sum + project.availability.available,
    0,
  );
  const cities = new Set(
    projects.map((project) => project.city).filter(Boolean),
  ).size;

  const stats = [
    {
      label: t("stats.projects"),
      value: String(projects.length),
      hint: t("stats.projectsHint"),
    },
    {
      label: t("stats.listings"),
      value: listingCount.toLocaleString(),
      hint: t("stats.availableHint", { count: availableCount }),
    },
    {
      label: t("stats.builders"),
      value: String(builderCount),
      hint: t("stats.buildersHint"),
    },
    {
      label: t("stats.cities"),
      value: String(cities || 1),
      hint: t("stats.citiesHint"),
    },
  ];

  return (
    <div className="relative z-10 mx-auto -mt-16 w-full max-w-content px-6">
      <div className="rounded-[20px] bg-background px-6 py-6 shadow-card sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <span className="shrink-0 rounded-pill border border-border-strong bg-background/70 px-4 py-1.5 text-xs font-medium tracking-wide text-ink-label">
            {t("stats.badge")}
          </span>
          <div className="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="border-border sm:border-r sm:pr-4 sm:last:border-r-0"
              >
                <p className="text-center text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                  {stat.label}
                </p>
                <p className="mt-1 text-center font-brand text-2xl font-bold text-ink">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-center text-xs font-medium text-success">
                  {stat.hint}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
