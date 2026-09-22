import { getLocale, setRequestLocale } from 'next-intl/server';

import { ServiceProvidersPage } from '@/features/admin/components/service-providers-page';

type AdminServiceProvidersPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminServiceProvidersPage({
  params,
}: AdminServiceProvidersPageProps) {
  await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  return <ServiceProvidersPage />;
}
