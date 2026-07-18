import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { getCompanyProfile } from "@/features/builder/api/company-profile-api";
import { BuilderNav } from "@/features/builder/components/builder-nav";
import { getMeOrNull } from "@/features/auth/api/auth-api";
import { Link, redirect } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/shared/ui/locale-switcher";

type BuilderLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Server-gated builder portal shell. Non-members get a generic 404.
 */
export default async function BuilderLayout({
  children,
  params,
}: BuilderLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? undefined;
  const user = await getMeOrNull(cookieHeader);

  if (!user) {
    redirect({ href: "/auth/login", locale });
    return null;
  }

  if (user.accountType !== "company_member") {
    notFound();
  }

  const companyName = await loadCompanyName(cookieHeader);
  const t = await getTranslations("Builder");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-content items-center justify-between gap-4 px-6 py-3">
          <Link
            href="/builder"
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
          <BuilderNav companyName={companyName} />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

const loadCompanyName = async (
  cookieHeader: string | undefined,
): Promise<string | null> => {
  try {
    const profile = await getCompanyProfile({ cookieHeader });
    return profile.name;
  } catch {
    return null;
  }
};
