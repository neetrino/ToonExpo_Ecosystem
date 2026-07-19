import { headers } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BuyerRequestsList } from "@/features/buyer/components/buyer-requests-list";
import { isBuyerAccount } from "@/features/buyer/utils/is-buyer-account";
import { getMeOrNull } from "@/features/auth/api/auth-api";
import { redirect } from "@/i18n/navigation";

type ProfileRequestsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ProfileRequestsPage({
  params,
}: ProfileRequestsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? undefined;
  const user = await getMeOrNull(cookieHeader);

  if (!user) {
    redirect({
      href: "/auth/login?returnUrl=%2Fprofile%2Frequests",
      locale,
    });
    return null;
  }

  if (!isBuyerAccount(user)) {
    redirect({ href: "/profile", locale });
    return null;
  }

  const t = await getTranslations("Profile.requests");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-ink">{t("title")}</h2>
        <p className="text-sm text-ink-secondary">{t("subtitle")}</p>
      </div>
      <BuyerRequestsList />
    </div>
  );
}
