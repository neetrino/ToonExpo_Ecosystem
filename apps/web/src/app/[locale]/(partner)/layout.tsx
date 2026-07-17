import type { ReactNode } from 'react';

import { AreaAccessGate } from '@/components/auth/area-access-gate';

type AreaLayoutProps = {
  children: ReactNode;
};

export default function PartnerLayout({ children }: AreaLayoutProps) {
  return <AreaAccessGate area="partner">{children}</AreaAccessGate>;
}
