import type { ProjectListItem } from "@toonexpo/contracts";
import { getTranslations } from "next-intl/server";

import { ProjectCard } from "@/features/catalog/components/project-card";
import { Link } from "@/i18n/navigation";

type FeaturedProjectsProps = {
  projects: ProjectListItem[];
};

/**
 * Home featured projects band (Variant A “New developments to watch”).
 */
export const FeaturedProjects = async ({ projects }: FeaturedProjectsProps) => {
  const t = await getTranslations("HomePage");
  const [featured, ...rest] = projects;

  return (
    <section className="mx-auto w-full max-w-content px-6 py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
            {t("featured.eyebrow")}
          </p>
          <h2 className="mt-2 text-[clamp(1.5rem,4vw,1.75rem)] font-bold tracking-tight text-ink">
            {t("featured.title")}
          </h2>
        </div>
        <Link
          href="/projects"
          className="text-[13px] font-semibold text-ink hover:text-brand"
        >
          {t("featured.viewAll")}
        </Link>
      </div>

      {featured ? (
        <div className="mb-4">
          <ProjectCard project={featured} featured className="sm:flex-row" />
        </div>
      ) : (
        <p className="text-sm text-ink-secondary">{t("featured.empty")}</p>
      )}

      {rest.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((project) => (
            <ProjectCard key={project.id} project={project} featured />
          ))}
        </div>
      ) : null}
    </section>
  );
};
