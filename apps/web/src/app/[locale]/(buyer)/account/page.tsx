import { setRequestLocale } from 'next-intl/server';

import { BuyerAccountClient } from './buyer-account-client';

type BuyerPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function BuyerAccountPage({ params }: BuyerPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <BuyerAccountClient />;
}
