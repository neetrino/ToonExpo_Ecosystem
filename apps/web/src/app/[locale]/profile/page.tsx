import { headers } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { getMeOrNull } from "@/features/auth/api/auth-api";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { getCompanyProfile } from "@/features/builder/api/company-profile-api";
import { getPortalPartner } from "@/features/partner/api/portal-partner-api";
import { isPartnerCompatibleCompany } from "@/features/partners/utils/is-partner-compatible-company";
import { redirect } from "@/i18n/navigation";
import { isApiErrorStatus } from "@/shared/api/errors";
import { Card } from "@/shared/ui/card";

type ProfilePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? undefined;
  const user = await getMeOrNull(cookieHeader);

  if (!user) {
    redirect({ href: "/auth/login", locale });
    return null;
  }

  if (user.accountType === "company_member") {
    const company = await loadCompanyProfile(cookieHeader);
    if (company && isPartnerCompatibleCompany(company.type)) {
      const partner = await loadPartnerProfile(cookieHeader);
      if (partner) {
        redirect({ href: "/partner", locale });
        return null;
      }
    }
  }

  const t = await getTranslations("Profile");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-ink">{t("title")}</h2>
        <p className="text-sm text-ink-secondary">{t("subtitle")}</p>
      </div>

      <Card className="flex flex-col gap-4">
        <dl className="flex flex-col gap-4">
          <ProfileRow label={t("fields.name")} value={user.name} />
          <ProfileRow label={t("fields.email")} value={user.email} />
          <ProfileRow
            label={t("fields.phone")}
            value={user.phone ?? t("fields.phoneEmpty")}
          />
          <ProfileRow label={t("fields.accountType")} value={user.accountType} />
        </dl>
        <div className="pt-2">
          <LogoutButton variant="secondary" size="md" className="w-full" />
        </div>
      </Card>
    </div>
  );
}

type ProfileRowProps = {
  label: string;
  value: string;
};

const loadCompanyProfile = async (cookieHeader: string | undefined) => {
  try {
    return await getCompanyProfile({ cookieHeader });
  } catch {
    return null;
  }
};

const loadPartnerProfile = async (cookieHeader: string | undefined) => {
  try {
    return await getPortalPartner({ cookieHeader });
  } catch (error) {
    if (isApiErrorStatus(error, 404)) {
      return null;
    }
    return null;
  }
};

const ProfileRow = ({ label, value }: ProfileRowProps) => (
  <div className="flex flex-col gap-1 border-b border-border pb-3 last:border-b-0 last:pb-0">
    <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">
      {label}
    </dt>
    <dd className="text-sm font-medium text-ink">{value}</dd>
  </div>
);
