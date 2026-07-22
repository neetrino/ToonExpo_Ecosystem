import type { ReactNode } from 'react';

import { BuyerAccountLayout } from '@/features/buyer/components/account/buyer-account-layout';

type FavoritesLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function FavoritesLayout(props: FavoritesLayoutProps) {
  return <BuyerAccountLayout {...props} />;
}
