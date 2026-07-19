import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { SiteFooter } from "@/features/catalog/components/site-footer";
import { ExpoMapPage } from "@/features/exhibition/components/public/expo-map-page";
import { SiteHeader } from "@/shared/ui/site-header";

type ExpoPageProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async ({
  params,
}: ExpoPageProps): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Expo" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
};

export default async function ExpoRoutePage({ params }: ExpoPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <ExpoMapPage />
      <SiteFooter />
    </div>
  );
}
