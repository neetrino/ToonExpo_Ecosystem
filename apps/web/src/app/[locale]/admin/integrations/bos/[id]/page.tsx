import { getLocale, setRequestLocale } from 'next-intl/server';

import { BosProvisioningDetailPage } from '@/features/admin/components/bos-provisioning-detail-page';

type AdminBosProvisioningDetailRouteProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AdminBosProvisioningDetailRoute({
  params,
}: AdminBosProvisioningDetailRouteProps) {
  const { id } = await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  return <BosProvisioningDetailPage requestId={id} />;
}
