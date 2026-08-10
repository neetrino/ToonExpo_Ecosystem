import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { CheckinPage } from '@/features/exhibition/components/checkin/checkin-page';

type StaffCheckinPageProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async ({ params }: StaffCheckinPageProps): Promise<Metadata> => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Checkin' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
};

/**
 * Entrance-staff event check-in scanner.
 */
export default function StaffCheckinPage() {
  return <CheckinPage />;
}
