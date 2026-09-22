import { getLocale, setRequestLocale } from "next-intl/server";

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
  const { id } = await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  return <ApartmentDetailPage apartmentId={id} />;
}
