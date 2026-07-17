import type { ReactNode } from 'react';

import { AreaAccessGate } from '@/components/auth/area-access-gate';

type AreaLayoutProps = {
  children: ReactNode;
};

export default function EntranceLayout({ children }: AreaLayoutProps) {
  return <AreaAccessGate area="entrance">{children}</AreaAccessGate>;
}
