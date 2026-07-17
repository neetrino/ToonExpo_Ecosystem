import { setRequestLocale } from 'next-intl/server';

import { PartnerOffersClient } from './partner-offers-client';

type PartnerOffersPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PartnerOffersPage({ params }: PartnerOffersPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PartnerOffersClient />;
}
