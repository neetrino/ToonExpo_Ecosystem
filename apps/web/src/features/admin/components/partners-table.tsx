"use client";

import type { AdminPartnerListItem } from "@toonexpo/contracts";
import { useLocale, useTranslations } from "next-intl";

import {
  FeaturedBadge,
  PartnerStatusBadge,
  PublicationStatusBadge,
} from "@/features/partners/components/partner-badges";
import { PartnerTypeLabel } from "@/features/partners/components/partner-type-label";
import { Link } from "@/i18n/navigation";

type PartnersTableProps = {
  partners: AdminPartnerListItem[];
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
 * Dense partners table for the platform admin list.
 */
export const PartnersTable = ({ partners }: PartnersTableProps) => {
  const t = useTranslations("Admin.partners");
  const locale = useLocale();

  return (
    <div className="overflow-x-auto rounded-sm border border-border">
      <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
        <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
          <tr>
            <th className="px-3 py-2 font-medium">{t("columns.name")}</th>
            <th className="px-3 py-2 font-medium">{t("columns.type")}</th>
            <th className="px-3 py-2 font-medium">{t("columns.status")}</th>
            <th className="px-3 py-2 font-medium">{t("columns.publication")}</th>
            <th className="px-3 py-2 font-medium">{t("columns.updatedAt")}</th>
          </tr>
        </thead>
        <tbody>
          {partners.map((partner) => (
            <tr
              key={partner.id}
              className="border-t border-border hover:bg-surface/60"
            >
              <td className="px-3 py-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/partners/${partner.id}`}
                    className="font-medium text-brand hover:underline"
                  >
                    {partner.name}
                  </Link>
                  <FeaturedBadge featured={partner.featured} />
                </div>
              </td>
              <td className="px-3 py-2.5 text-ink-secondary">
                <PartnerTypeLabel type={partner.type} />
              </td>
              <td className="px-3 py-2.5">
                <PartnerStatusBadge status={partner.status} />
              </td>
              <td className="px-3 py-2.5">
                <PublicationStatusBadge status={partner.publicationStatus} />
              </td>
              <td className="px-3 py-2.5 text-ink-secondary">
                {formatDate(partner.updatedAt, locale)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
