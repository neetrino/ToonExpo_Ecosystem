import { setRequestLocale } from 'next-intl/server';

import { EntranceCheckInClient } from './entrance-checkin-client';

type EntranceCheckInPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function EntranceCheckInPage({ params }: EntranceCheckInPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <EntranceCheckInClient />;
}
