import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CheckinPage } from "@/features/exhibition/components/checkin/checkin-page";

type CheckinPageProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async ({
  params,
}: CheckinPageProps): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Checkin" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
};

export default async function CheckinRoutePage({ params }: CheckinPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CheckinPage />;
}
