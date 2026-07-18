import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { MortgagePageContent } from "@/features/mortgage/components/mortgage-page-content";
import { SiteFooter } from "@/features/catalog/components/site-footer";
import { SiteHeader } from "@/shared/ui/site-header";

type MortgagePageProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async ({
  params,
}: MortgagePageProps): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Mortgage" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
};

export default async function MortgagePage({ params }: MortgagePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-content px-6 py-10">
        <MortgagePageContent />
      </main>
      <SiteFooter />
    </div>
  );
}
