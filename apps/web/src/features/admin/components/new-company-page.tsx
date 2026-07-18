"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { CreateCompanyForm } from "@/features/admin/components/create-company-form";
import { Link } from "@/i18n/navigation";
import { Card } from "@/shared/ui/card";

/**
 * New-company flow: form → invite-sent confirmation.
 */
export const NewCompanyPage = () => {
  const t = useTranslations("Admin.companies");
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null);

  if (invitedEmail) {
    return (
      <div className="flex max-w-lg flex-col gap-4">
        <h1 className="text-xl font-semibold text-ink">
          {t("inviteSuccess.title")}
        </h1>
        <p className="text-sm text-ink-secondary">
          {t("inviteSuccess.message", { email: invitedEmail })}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/companies"
            className="inline-flex h-9 items-center justify-center rounded-pill bg-cta-dark px-4 text-sm font-medium text-on-dark hover:bg-cta-dark/90"
          >
            {t("inviteSuccess.backToList")}
          </Link>
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-pill border border-border-strong px-4 text-sm font-medium text-ink hover:bg-surface"
            onClick={() => setInvitedEmail(null)}
          >
            {t("inviteSuccess.createAnother")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/admin/companies"
          className="text-sm text-ink-secondary hover:text-ink"
        >
          {t("detail.back")}
        </Link>
        <h1 className="text-xl font-semibold text-ink">{t("new.title")}</h1>
        <p className="text-sm text-ink-secondary">{t("new.subtitle")}</p>
      </div>
      <Card className="max-w-xl">
        <CreateCompanyForm onSuccess={setInvitedEmail} />
      </Card>
    </div>
  );
};
