import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { listBuilders, listProjects } from "@/features/catalog/api/catalog-api";
import { FeaturedProjects } from "@/features/catalog/components/featured-projects";
import { HomeBuilders } from "@/features/catalog/components/home-builders";
import { HomeHero } from "@/features/catalog/components/home-hero";
import { HomeStats } from "@/features/catalog/components/home-stats";
import { SiteFooter } from "@/features/catalog/components/site-footer";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async ({
  params,
}: HomePageProps): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [projectsResponse, builders] = await Promise.all([
    listProjects({ page: 1, pageSize: 4 }),
    listBuilders(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <HomeHero />
      <HomeStats
        projects={projectsResponse.data}
        builderCount={builders.length}
      />
      <FeaturedProjects projects={projectsResponse.data} />
      <HomeBuilders builders={builders} />
      <SiteFooter />
    </div>
  );
}
