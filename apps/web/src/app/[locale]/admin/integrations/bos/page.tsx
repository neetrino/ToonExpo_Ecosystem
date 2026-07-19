import { setRequestLocale } from 'next-intl/server';

import { BosProvisioningListPage } from '@/features/admin/components/bos-provisioning-list-page';

type AdminBosProvisioningPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminBosProvisioningPage({ params }: AdminBosProvisioningPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <BosProvisioningListPage />;
}
