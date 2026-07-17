import { setRequestLocale } from 'next-intl/server';

import { PartnerProfileClient } from './partner-profile-client';

type PartnerProfilePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PartnerProfilePage({ params }: PartnerProfilePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PartnerProfileClient />;
}
