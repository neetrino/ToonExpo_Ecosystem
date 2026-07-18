import { setRequestLocale } from "next-intl/server";

import { ApartmentDetailPage } from "@/features/builder/components/apartment-detail-page";

type BuilderApartmentPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

/**
 * Apartment edit route.
 */
export default async function BuilderApartmentPage({
  params,
}: BuilderApartmentPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <ApartmentDetailPage apartmentId={id} />;
}
