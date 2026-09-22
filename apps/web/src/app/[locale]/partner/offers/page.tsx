import { getLocale, setRequestLocale } from 'next-intl/server';

import { PartnerOffersPage } from '@/features/partner/components/partner-offers-page';

type PartnerOffersRouteProps = {
  params: Promise<{ locale: string }>;
};

export default async function PartnerOffersRoute({ params }: PartnerOffersRouteProps) {
  await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  return <PartnerOffersPage />;
}
