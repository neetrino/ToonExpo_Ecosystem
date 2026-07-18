import { getTranslations, setRequestLocale } from "next-intl/server";

import { getHealth } from "@/shared/api/health";
import { ApiStatus } from "@/shared/ui/api-status";
import { LocaleSwitcher } from "@/shared/ui/locale-switcher";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("HomePage");
  const health = await getHealth();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-10 px-6 py-16">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <p className="text-4xl font-semibold tracking-tight text-zinc-900">
            {t("brand")}
          </p>
          <LocaleSwitcher />
        </div>
        <h1 className="text-xl font-medium text-zinc-800">{t("tagline")}</h1>
        <p className="max-w-2xl text-base leading-relaxed text-zinc-600">
          {t("description")}
        </p>
      </header>

      <section aria-label={t("apiStatusLabel")}>
        <ApiStatus health={health} />
      </section>
    </main>
  );
}
