import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { HeroSearch } from "@/features/catalog/components/hero-search";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/shared/ui/site-header";

/**
 * Variant A hero: full-bleed photo, display wordmark, search, CTAs.
 */
export const HomeHero = async () => {
  const t = await getTranslations("HomePage");

  return (
    <section className="relative isolate min-h-[min(100svh,754px)] overflow-hidden">
      <Image
        src="/images/hero-variant-a.png"
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      <div className="absolute inset-0 bg-ink/25" />

      <div className="relative flex min-h-[min(100svh,754px)] flex-col">
        <SiteHeader variant="transparent" />

        <div className="mx-auto flex w-full max-w-content flex-1 flex-col items-center justify-center px-6 pb-28 pt-10 text-center">
          <p className="mb-2 text-[10px] font-normal uppercase tracking-[2px] text-on-dark">
            {t("hero.eyebrow")}
          </p>
          <h1 className="font-display text-[clamp(3rem,12vw,6.75rem)] font-normal leading-none tracking-tight text-on-dark">
            {t("hero.title")}
          </h1>
          <p className="mt-6 text-[clamp(1.25rem,3vw,2rem)] font-bold tracking-tight text-on-dark">
            {t("hero.findProject")}
          </p>

          <div className="mt-8 w-full">
            <HeroSearch className="mx-auto" />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/projects"
              className="inline-flex h-12 items-center justify-center rounded-sm bg-cta-dark px-8 text-[13px] font-medium text-on-dark hover:bg-cta-dark/90"
            >
              {t("hero.explore")}
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex h-12 items-center justify-center rounded-sm bg-on-dark px-8 text-[13px] font-medium text-ink hover:bg-on-dark/90"
            >
              {t("hero.register")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
