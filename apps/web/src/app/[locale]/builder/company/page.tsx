import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CompanyProfileForm } from "@/features/builder/components/company-profile-form";
import { getCompanyProfile } from "@/features/builder/api/company-profile-api";

type CompanyPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function BuilderCompanyPage({ params }: CompanyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Builder.company");
  const profile = await getCompanyProfile();

  return (
    <CompanyPageShell title={t("title")} subtitle={t("subtitle")}>
      <CompanyProfileForm
        logoMediaId={profile.logoMediaId}
        logoUrl={profile.logoUrl}
        canEdit={profile.role === "company_admin"}
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
    <div className="flex flex-col gap-1">
      <h1 className="text-xl font-semibold text-ink">{title}</h1>
      <p className="text-sm text-ink-secondary">{subtitle}</p>
    </div>
    {children}
  </div>
);
