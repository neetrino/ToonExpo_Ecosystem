import { headers } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { getMeOrNull } from "@/features/auth/api/auth-api";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { redirect } from "@/i18n/navigation";
import { Card } from "@/shared/ui/card";
import { SiteHeader } from "@/shared/ui/site-header";

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

  const t = await getTranslations("Profile");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-6 py-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {t("title")}
          </h1>
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
      </main>
    </div>
  );
}

type ProfileRowProps = {
  label: string;
  value: string;
};

const ProfileRow = ({ label, value }: ProfileRowProps) => (
  <div className="flex flex-col gap-1 border-b border-border pb-3 last:border-b-0 last:pb-0">
    <dt className="text-xs font-medium uppercase tracking-wide text-ink-muted">
      {label}
    </dt>
    <dd className="text-sm font-medium text-ink">{value}</dd>
  </div>
);
