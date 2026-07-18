import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { listBuilders } from "@/features/catalog/api/catalog-api";
import { BuilderCard } from "@/features/catalog/components/builder-card";
import { SiteFooter } from "@/features/catalog/components/site-footer";
import { SiteHeader } from "@/shared/ui/site-header";

type BuildersPageProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async ({
  params,
}: BuildersPageProps): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Catalog" });

  return {
    title: t("buildersPage.meta.title"),
    description: t("buildersPage.meta.description"),
  };
};

export default async function BuildersPage({ params }: BuildersPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Catalog");
  const builders = await listBuilders();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-content px-6 py-10">
        <header className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            {t("buildersPage.title")}
          </h1>
          <p className="text-sm text-ink-secondary">
            {t("buildersPage.subtitle", { count: builders.length })}
          </p>
        </header>

        {builders.length === 0 ? (
          <p className="text-sm text-ink-secondary">{t("buildersPage.empty")}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {builders.map((builder) => (
              <BuilderCard key={builder.id} builder={builder} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
