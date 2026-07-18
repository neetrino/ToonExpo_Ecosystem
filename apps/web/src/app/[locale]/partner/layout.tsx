import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { getCompanyProfile } from "@/features/builder/api/company-profile-api";
import { getPortalPartner } from "@/features/partner/api/portal-partner-api";
import { PartnerNav } from "@/features/partner/components/partner-nav";
import { getMeOrNull } from "@/features/auth/api/auth-api";
import { isPartnerCompatibleCompany } from "@/features/partners/utils/is-partner-compatible-company";
import { Link, redirect } from "@/i18n/navigation";
import { isApiErrorStatus } from "@/shared/api/errors";
import { LocaleSwitcher } from "@/shared/ui/locale-switcher";

type PartnerLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Server-gated partner portal shell for partner/bank/service company members.
 */
export default async function PartnerLayout({
  children,
  params,
}: PartnerLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? undefined;
  const user = await getMeOrNull(cookieHeader);

  if (!user) {
    redirect({ href: "/auth/login?returnUrl=%2Fpartner", locale });
    return null;
  }

  if (user.accountType !== "company_member") {
    notFound();
  }

  const company = await loadCompanyProfile(cookieHeader);
  if (!company || !isPartnerCompatibleCompany(company.type)) {
    notFound();
  }

  const partner = await loadPartnerProfile(cookieHeader);
  if (!partner) {
    notFound();
  }

  const t = await getTranslations("Partner");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-content items-center justify-between gap-4 px-6 py-3">
          <Link
            href="/partner"
            className="font-brand text-base font-extrabold tracking-tight text-ink"
          >
            <span>TOON</span>
            <span className="text-brand">EXPO</span>
            <span className="ml-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
              {t("badge")}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-ink-secondary sm:inline">
              {user.email}
            </span>
            <LocaleSwitcher />
            <Link
              href="/profile"
              className="text-sm font-medium text-ink-secondary hover:text-ink"
            >
              {t("profileLink")}
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-content flex-col gap-8 px-6 py-8 md:flex-row">
        <aside className="w-full shrink-0 md:w-56">
          <PartnerNav companyName={company.name} partnerName={partner.name} />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

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
