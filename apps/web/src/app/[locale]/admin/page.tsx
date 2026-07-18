import { setRequestLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";

type AdminIndexPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Admin root redirects to the companies section.
 */
export default async function AdminIndexPage({ params }: AdminIndexPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect({ href: "/admin/companies", locale });
  return null;
}
