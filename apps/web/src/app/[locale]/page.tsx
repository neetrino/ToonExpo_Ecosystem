import { getTranslations, setRequestLocale } from "next-intl/server";

import { getHealth } from "@/shared/api/health";
import { ApiStatus } from "@/shared/ui/api-status";
import { SiteHeader } from "@/shared/ui/site-header";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("HomePage");
  const health = await getHealth();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-16">
        <header className="flex flex-col gap-4">
          <p className="font-brand text-4xl font-bold tracking-tight text-ink">
            {t("brand")}
          </p>
          <h1 className="text-xl font-medium text-ink">{t("tagline")}</h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink-secondary">
            {t("description")}
          </p>
        </header>

        <section aria-label={t("apiStatusLabel")}>
          <ApiStatus health={health} />
        </section>
      </main>
    </div>
  );
}
