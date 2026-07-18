import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { AdminNav } from "@/features/admin/components/admin-nav";
import { getMeOrNull } from "@/features/auth/api/auth-api";
import { Link, redirect } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/shared/ui/locale-switcher";

type AdminLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Server-gated platform admin shell. Non-admins get a generic 404.
 */
export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? undefined;
  const user = await getMeOrNull(cookieHeader);

  if (!user) {
    redirect({ href: "/auth/login", locale });
    return null;
  }

  if (user.accountType !== "platform_admin") {
    notFound();
  }

  const t = await getTranslations("Admin");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex w-full max-w-content items-center justify-between gap-4 px-6 py-3">
          <Link
            href="/admin/companies"
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
        <aside className="w-full shrink-0 md:w-48">
          <AdminNav />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
