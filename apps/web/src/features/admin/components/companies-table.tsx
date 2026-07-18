"use client";

import type { CompanyResponse } from "@toonexpo/contracts";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

type CompaniesTableProps = {
  companies: CompanyResponse[];
};

const formatDate = (iso: string, locale: string): string => {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
};

/**
 * Dense companies table for the platform admin list.
 */
export const CompaniesTable = ({ companies }: CompaniesTableProps) => {
  const t = useTranslations("Admin.companies");
  const locale = useLocale();

  return (
    <div className="overflow-x-auto rounded-sm border border-border">
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
          <tr>
            <th className="px-3 py-2 font-medium">{t("columns.name")}</th>
            <th className="px-3 py-2 font-medium">{t("columns.type")}</th>
            <th className="px-3 py-2 font-medium">{t("columns.status")}</th>
            <th className="px-3 py-2 font-medium">{t("columns.createdAt")}</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr
              key={company.id}
              className="border-t border-border hover:bg-surface/60"
            >
              <td className="px-3 py-2.5">
                <Link
                  href={`/admin/companies/${company.id}`}
                  className="font-medium text-brand hover:underline"
                >
                  {company.name}
                </Link>
              </td>
              <td className="px-3 py-2.5 text-ink-secondary">
                {t(`types.${company.type}`)}
              </td>
              <td className="px-3 py-2.5 text-ink-secondary">
                {t(`statuses.${company.status}`)}
              </td>
              <td className="px-3 py-2.5 text-ink-secondary">
                {formatDate(company.createdAt, locale)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
