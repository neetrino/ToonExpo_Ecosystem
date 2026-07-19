import { setRequestLocale } from 'next-intl/server';

import { BosProvisioningDetailPage } from '@/features/admin/components/bos-provisioning-detail-page';

type AdminBosProvisioningDetailRouteProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AdminBosProvisioningDetailRoute({
  params,
}: AdminBosProvisioningDetailRouteProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <BosProvisioningDetailPage requestId={id} />;
}
