import { setRequestLocale } from "next-intl/server";

import { BankOffersListPage } from "@/features/admin/components/bank-offers-list-page";

type AdminBankOffersPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminBankOffersPage({
  params,
}: AdminBankOffersPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <BankOffersListPage />;
}
