import { getTranslations, setRequestLocale } from "next-intl/server";

import { SetPasswordForm } from "@/features/auth/components/set-password-form";
import { Card } from "@/shared/ui/card";
import { SiteHeader } from "@/shared/ui/site-header";

type SetPasswordPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const readToken = (
  raw: Record<string, string | string[] | undefined>,
): string | null => {
  const value = raw["token"];
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  if (Array.isArray(value) && value[0] && value[0].trim().length > 0) {
    return value[0].trim();
  }
  return null;
};

export default async function SetPasswordPage({
  params,
  searchParams,
}: SetPasswordPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Auth");
  const token = readToken(await searchParams);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-12">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {t("setPassword.title")}
          </h1>
          <p className="text-sm text-ink-secondary">
            {t("setPassword.subtitle")}
          </p>
        </div>
        <Card>
          {token ? (
            <SetPasswordForm token={token} />
          ) : (
            <div
              role="alert"
              className="flex flex-col gap-2 text-sm text-danger"
            >
              <p>{t("errors.invalidToken")}</p>
              <p className="text-ink-secondary">
                {t("setPassword.supportHint")}
              </p>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
