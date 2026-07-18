import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { getMeOrNull } from "@/features/auth/api/auth-api";
import { Link, redirect } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/shared/ui/locale-switcher";

type CheckinLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

const CHECKIN_ACCOUNT_TYPES = new Set(["entrance_staff", "platform_admin"]);

/**
 * Server-gated check-in shell for entrance staff and platform admins.
 */
export default async function CheckinLayout({
  children,
  params,
}: CheckinLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? undefined;
  const user = await getMeOrNull(cookieHeader);

  if (!user) {
    redirect({ href: "/auth/login?returnUrl=%2Fcheckin", locale });
    return null;
  }

  if (!CHECKIN_ACCOUNT_TYPES.has(user.accountType)) {
    notFound();
  }

  const t = await getTranslations("Checkin");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-content items-center justify-between gap-4 px-6 py-3">
          <Link
            href="/checkin"
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
      <main className="mx-auto w-full max-w-content px-6 py-8">{children}</main>
    </div>
  );
}
