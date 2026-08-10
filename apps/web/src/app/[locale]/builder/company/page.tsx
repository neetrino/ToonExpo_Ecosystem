import type { ReactNode } from 'react';
import { Building2 } from 'lucide-react';
import { headers } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { CompanyProfileForm } from '@/features/builder/components/company-profile-form';
import { getCompanyProfileCached as getCompanyProfile } from '@/features/builder/api/get-company-profile-cached';
import { PageTitleBlock } from '@/shared/ui/page-title-icon';

type CompanyPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function BuilderCompanyPage({ params }: CompanyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Builder.company');
  const headerStore = await headers();
  const cookieHeader = headerStore.get('cookie') ?? undefined;
  const profile = await getCompanyProfile(cookieHeader);

  return (
    <CompanyPageShell title={t('title')} subtitle={t('subtitle')}>
      <CompanyProfileForm
        logoMediaId={profile.logoMediaId}
        logoUrl={profile.logoUrl}
        canEdit={profile.role === 'company_admin'}
      />
    </CompanyPageShell>
  );
}

const CompanyPageShell = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-6">
    <PageTitleBlock title={title} subtitle={subtitle} icon={Building2} />
    {children}
  </div>
);
