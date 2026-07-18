"use client";

import type {
  PartnerCompanyStatus,
  PartnerCompanyType,
  PublicationStatus,
} from "@toonexpo/contracts";
import { useTranslations } from "next-intl";

import { PARTNER_COMPANY_STATUSES, PARTNER_COMPANY_TYPES, PARTNER_PUBLICATION_STATUSES } from "@/features/partners/constants";

type PartnerFiltersProps = {
  type: PartnerCompanyType | "";
  status: PartnerCompanyStatus | "";
  publicationStatus: PublicationStatus | "";
  search: string;
  onChange: (next: {
    type: PartnerCompanyType | "";
    status: PartnerCompanyStatus | "";
    publicationStatus: PublicationStatus | "";
    search: string;
  }) => void;
};

const selectClassName =
  "h-10 rounded-sm border border-border bg-background px-3 text-sm text-ink";

/**
 * Filter row for admin partners list.
 */
export const PartnerFilters = ({
  type,
  status,
  publicationStatus,
  search,
  onChange,
}: PartnerFiltersProps) => {
  const t = useTranslations("Admin.partners.filters");

  return (
    <div className="flex flex-wrap gap-3">
      <label className="flex min-w-[10rem] flex-1 flex-col gap-1 text-xs text-ink-muted">
        {t("search")}
        <input
          type="search"
          className={selectClassName}
          value={search}
          placeholder={t("searchPlaceholder")}
          onChange={(event) => {
            onChange({ type, status, publicationStatus, search: event.target.value });
          }}
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-ink-muted">
        {t("type")}
        <select
          className={selectClassName}
          value={type}
          onChange={(event) => {
            onChange({
              type: event.target.value as PartnerCompanyType | "",
              status,
              publicationStatus,
              search,
            });
          }}
        >
          <option value="">{t("allTypes")}</option>
          {PARTNER_COMPANY_TYPES.map((item) => (
            <option key={item} value={item}>
              {t(`types.${item}`)}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-ink-muted">
        {t("status")}
        <select
          className={selectClassName}
          value={status}
          onChange={(event) => {
            onChange({
              type,
              status: event.target.value as PartnerCompanyStatus | "",
              publicationStatus,
              search,
            });
          }}
        >
          <option value="">{t("allStatuses")}</option>
          {PARTNER_COMPANY_STATUSES.map((item) => (
            <option key={item} value={item}>
              {t(`statuses.${item}`)}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-ink-muted">
        {t("publication")}
        <select
          className={selectClassName}
          value={publicationStatus}
          onChange={(event) => {
            onChange({
              type,
              status,
              publicationStatus: event.target.value as PublicationStatus | "",
              search,
            });
          }}
        >
          <option value="">{t("allPublication")}</option>
          {PARTNER_PUBLICATION_STATUSES.map((item) => (
            <option key={item} value={item}>
              {t(`publicationStatuses.${item}`)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};
