import { setRequestLocale } from "next-intl/server";

import { CrmDealDetailPage } from "@/features/builder/components/crm-deal-detail-page";

type BuilderCrmDealPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

/**
 * Constructor CRM deal detail sheet.
 */
export default async function BuilderCrmDealPage({
  params,
}: BuilderCrmDealPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <CrmDealDetailPage dealId={id} />;
}
