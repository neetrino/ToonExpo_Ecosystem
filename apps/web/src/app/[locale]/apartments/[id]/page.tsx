import type { Metadata } from "next";
import Image from "next/image";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";

import { getApartment } from "@/features/catalog/api/catalog-api";
import { RequestPriceButton } from "@/features/catalog/components/request-price-button";
import { SiteFooter } from "@/features/catalog/components/site-footer";
import { formatCatalogPrice } from "@/features/catalog/utils/format-price";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/shared/ui/site-header";

type ApartmentPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

const loadApartment = async (id: string, locale: string) => {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? undefined;
  return getApartment(id, { locale, cookieHeader });
};

export const generateMetadata = async ({
  params,
}: ApartmentPageProps): Promise<Metadata> => {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "Catalog" });
  const apartment = await loadApartment(id, locale);

  if (!apartment) {
    return { title: t("apartment.notFoundTitle") };
  }

  return {
    title: t("apartment.metaTitle", {
      number: apartment.number,
      project: apartment.project.name,
    }),
    description:
      apartment.description ??
      t("apartment.metaFallback", {
        number: apartment.number,
        project: apartment.project.name,
      }),
  };
};

export default async function ApartmentPage({ params }: ApartmentPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const apartment = await loadApartment(id, locale);
  if (!apartment) {
    notFound();
  }

  const t = await getTranslations("Catalog");
  const activeLocale = await getLocale();
  const price = formatCatalogPrice({
    amount: apartment.price,
    currency: apartment.priceCurrency,
    locale: activeLocale,
    priceVisibility: apartment.priceVisibility,
    onRequestLabel: t("price.onRequest"),
    signInLabel: t("price.signInToSee"),
  });
  const needsSignIn =
    apartment.priceVisibility === "visible_after_login" &&
    apartment.price == null;
  const showRequestCta =
    apartment.priceVisibility === "by_request" ||
    (apartment.priceVisibility === "public" && apartment.price == null);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-content px-6 py-10">
        <nav className="mb-6 text-sm text-ink-secondary">
          <Link href="/projects" className="hover:text-ink">
            {t("projects.title")}
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/projects/${apartment.project.id}`}
            className="hover:text-ink"
          >
            {apartment.project.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink">
            {t("apartment.unit", { number: apartment.number })}
          </span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-surface">
            {apartment.plan ? (
              <Image
                src={apartment.plan.fileUrl}
                alt={apartment.plan.altText ?? apartment.number}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
                priority
              />
            ) : (
              <div className="flex size-full items-center justify-center text-sm text-ink-muted">
                {t("apartment.noPlan")}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <header>
              <p className="text-xs font-medium uppercase tracking-widest text-ink-muted">
                {apartment.builder.name} · {apartment.building.name}
              </p>
              <h1 className="mt-2 font-brand text-3xl font-bold text-ink">
                {t("apartment.unit", { number: apartment.number })}
              </h1>
              <p className="mt-1 text-sm text-ink-secondary">
                {t("apartment.floor", {
                  floor:
                    apartment.floor.displayLabel ??
                    String(apartment.floor.number),
                })}
              </p>
            </header>

            {needsSignIn ? (
              <p className="font-brand text-2xl font-bold text-ink">
                <Link href="/auth/login" className="underline-offset-4 hover:underline">
                  {price}
                </Link>
              </p>
            ) : (
              <p className="font-brand text-3xl font-bold text-ink">{price}</p>
            )}

            <dl className="grid grid-cols-2 gap-3">
              <Detail
                label={t("apartment.statusLabel")}
                value={t(`status.${apartment.salesStatus}`)}
              />
              {apartment.rooms != null ? (
                <Detail
                  label={t("apartment.roomsLabel")}
                  value={String(apartment.rooms)}
                />
              ) : null}
              {apartment.areaTotal != null ? (
                <Detail
                  label={t("apartment.areaLabel")}
                  value={t("apartment.area", { area: apartment.areaTotal })}
                />
              ) : null}
              {apartment.bedrooms != null ? (
                <Detail
                  label={t("apartment.bedroomsLabel")}
                  value={String(apartment.bedrooms)}
                />
              ) : null}
              {apartment.bathrooms != null ? (
                <Detail
                  label={t("apartment.bathroomsLabel")}
                  value={String(apartment.bathrooms)}
                />
              ) : null}
            </dl>

            {apartment.description ? (
              <p className="text-sm leading-relaxed text-ink-secondary">
                {apartment.description}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              {showRequestCta ? (
                <RequestPriceButton
                  projectId={apartment.project.id}
                  apartmentId={apartment.id}
                  labelKey="requestPrice"
                />
              ) : null}
              <Link
                href={`/projects/${apartment.project.id}`}
                className="inline-flex h-11 items-center justify-center rounded-pill border border-border-strong px-5 text-sm font-medium text-ink hover:bg-surface"
              >
                {t("actions.viewProject")}
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

const Detail = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="rounded-sm bg-surface px-3 py-3">
      <dt className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
};
