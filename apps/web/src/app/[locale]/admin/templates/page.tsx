import { getLocale, setRequestLocale } from 'next-intl/server';

import { BankPartnerOfferTemplatesListPage } from '@/features/admin/components/bank-partner-offer-templates-list-page';

type AdminTemplatesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminTemplatesPage({ params }: AdminTemplatesPageProps) {
  await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  return <BankPartnerOfferTemplatesListPage />;
}
