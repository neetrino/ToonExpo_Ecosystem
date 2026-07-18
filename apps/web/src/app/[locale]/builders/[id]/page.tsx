import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { cache } from "react";

import { getBuilder } from "@/features/catalog/api/catalog-api";
import { ProjectCard } from "@/features/catalog/components/project-card";
import { SiteFooter } from "@/features/catalog/components/site-footer";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/shared/ui/site-header";

type BuilderDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

const loadBuilder = cache((id: string, locale: string) =>
  getBuilder(id, { locale }),
);

export const generateMetadata = async ({
  params,
}: BuilderDetailPageProps): Promise<Metadata> => {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "Catalog" });
  const builder = await loadBuilder(id, locale);

  if (!builder) {
    return { title: t("buildersPage.notFoundTitle") };
  }

  return {
    title: t("buildersPage.detail.metaTitle", { name: builder.name }),
    description:
      builder.description ??
      t("buildersPage.detail.metaDescription", { name: builder.name }),
  };
};

export default async function BuilderDetailPage({ params }: BuilderDetailPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const builder = await loadBuilder(id, locale);
  if (!builder) {
    notFound();
  }

  const t = await getTranslations("Catalog");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-content px-6 py-10">
        <div className="mb-8 flex flex-col gap-4">
          <Link
            href="/builders"
            className="text-sm text-ink-secondary hover:text-ink"
          >
            {t("buildersPage.detail.back")}
          </Link>
          <div className="flex items-start gap-4">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-surface">
              {builder.logoUrl ? (
                <Image
                  src={builder.logoUrl}
                  alt={builder.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="flex size-full items-center justify-center font-brand text-lg font-bold text-brand">
                  {builder.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-ink">
                {builder.name}
              </h1>
              {builder.description ? (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">
                  {builder.description}
                </p>
              ) : null}
              <p className="mt-2 text-sm text-ink-secondary">
                {t("builders.projectCount", {
                  count: builder.publishedProjectCount,
                })}
              </p>
              <Link
                href={`/projects?builderId=${encodeURIComponent(builder.id)}`}
                className="mt-3 inline-block text-sm font-semibold text-brand hover:underline"
              >
                {t("buildersPage.detail.catalogLink")}
              </Link>
            </div>
          </div>
        </div>

        <h2 className="mb-4 text-xl font-bold text-ink">
          {t("buildersPage.detail.projectsTitle")}
        </h2>
        {builder.projects.length === 0 ? (
          <p className="text-sm text-ink-secondary">
            {t("buildersPage.detail.emptyProjects")}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {builder.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
