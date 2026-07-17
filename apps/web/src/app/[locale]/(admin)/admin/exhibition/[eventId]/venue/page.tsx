import { setRequestLocale } from 'next-intl/server';

import { AdminVenueClient } from './admin-venue-client';

type AdminVenuePageProps = {
  params: Promise<{ locale: string; eventId: string }>;
};

export default async function AdminVenuePage({ params }: AdminVenuePageProps) {
  const { locale, eventId } = await params;
  setRequestLocale(locale);
  return <AdminVenueClient eventId={eventId} />;
}
