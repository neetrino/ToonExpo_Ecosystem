import type { ReactNode } from 'react';

import { BuyerAccountLayout } from '@/features/buyer/components/account/buyer-account-layout';

type RequestsLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RequestsLayout(props: RequestsLayoutProps) {
  return <BuyerAccountLayout {...props} />;
}
