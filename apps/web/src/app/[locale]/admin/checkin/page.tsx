import type { Metadata } from 'next';
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server';

import { CheckinPage } from '@/features/exhibition/components/checkin/checkin-page';

type AdminCheckinPageProps = {
  params: Promise<{ locale: string }>;
};

export const generateMetadata = async ({
  params,
}: AdminCheckinPageProps): Promise<Metadata> => {
  await params;
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'Checkin' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
};

/**
 * Platform admin check-in scanner — stays inside the admin shell.
 */
export default async function AdminCheckinRoutePage({ params }: AdminCheckinPageProps) {
  await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  return <CheckinPage />;
}
