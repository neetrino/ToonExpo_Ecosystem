"use client";

import type { BankOfferListItem, PublicationStatus } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { BankOfferForm } from "@/features/admin/components/bank-offer-form";
import {
  useAdminBankOffersQuery,
  useCreateBankOfferMutation,
  useDeleteBankOfferMutation,
  useUpdateBankOfferMutation,
} from "@/features/admin/hooks/use-admin-bank-offers";
import { useAdminPartnersQuery } from "@/features/admin/hooks/use-admin-partners";
import { ADMIN_COMPANIES_MAX_PAGE_SIZE } from "@/features/admin/constants";
import { useAdminCompaniesQuery } from "@/features/admin/hooks/use-admin-companies";
import { PARTNERS_DEFAULT_PAGE_SIZE } from "@/features/partners/constants";
import { PublicationStatusBadge } from "@/features/partners/components/partner-badges";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

/**
 * Admin bank offers list with filters, create/edit, and publish controls.
 */
export const BankOffersListPage = () => {
  const t = useTranslations("Admin.bankOffers");
  const [partnerFilter, setPartnerFilter] = useState("");
  const [publicationFilter, setPublicationFilter] = useState<PublicationStatus | "">("");
  const [editing, setEditing] = useState<BankOfferListItem | null>(null);
  const [creating, setCreating] = useState(false);

  const offersQuery = useAdminBankOffersQuery(
    partnerFilter ? { partnerCompanyId: partnerFilter } : {},
  );
  const partnersQuery = useAdminPartnersQuery({
    page: 1,
    pageSize: PARTNERS_DEFAULT_PAGE_SIZE,
    type: "bank",
  });
  const companiesQuery = useAdminCompaniesQuery(1, ADMIN_COMPANIES_MAX_PAGE_SIZE);

  const createMutation = useCreateBankOfferMutation();
  const updateMutation = useUpdateBankOfferMutation();
  const deleteMutation = useDeleteBankOfferMutation();

  const bankPartners = useMemo(() => {
    const companies = companiesQuery.data?.data ?? [];
    const partners = partnersQuery.data?.data ?? [];
    return partners
      .filter((partner) => partner.type === "bank")
      .map((partner) => ({
        companyId: partner.companyId,
        name: partner.name,
      }))
      .filter((item) => companies.some((company) => company.id === item.companyId));
  }, [companiesQuery.data, partnersQuery.data]);

  const filteredOffers = useMemo(() => {
    const offers = offersQuery.data?.data ?? [];
    if (!publicationFilter) {
      return offers;
    }
    return offers.filter((offer) => offer.publicationStatus === publicationFilter);
  }, [offersQuery.data, publicationFilter]);

  const busy =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  if (offersQuery.isLoading || partnersQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">{t("loading")}</p>;
  }

  if (offersQuery.isError || !offersQuery.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t("error")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-ink">{t("title")}</h1>
          <p className="text-sm text-ink-secondary">{t("subtitle")}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => {
            setCreating(true);
            setEditing(null);
          }}
        >
          {t("newOffer")}
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          className="h-10 rounded-sm border border-border bg-background px-3 text-sm"
          value={partnerFilter}
          onChange={(event) => {
            setPartnerFilter(event.target.value);
          }}
        >
          <option value="">{t("filters.allBanks")}</option>
          {bankPartners.map((partner) => (
            <option key={partner.companyId} value={partner.companyId}>
              {partner.name}
            </option>
          ))}
        </select>
        <select
          className="h-10 rounded-sm border border-border bg-background px-3 text-sm"
          value={publicationFilter}
          onChange={(event) => {
            setPublicationFilter(event.target.value as PublicationStatus | "");
          }}
        >
          <option value="">{t("filters.allPublication")}</option>
          <option value="draft">{t("filters.draft")}</option>
          <option value="published">{t("filters.published")}</option>
          <option value="archived">{t("filters.archived")}</option>
        </select>
      </div>

      {creating ? (
        <Card className="max-w-2xl">
          <h2 className="mb-4 text-base font-semibold text-ink">{t("createTitle")}</h2>
          <BankOfferForm
            bankPartners={bankPartners}
            isBusy={busy}
            onCancel={() => {
              setCreating(false);
            }}
            onCreate={async (body) => {
              await createMutation.mutateAsync(body);
              setCreating(false);
            }}
          />
        </Card>
      ) : null}

      {editing ? (
        <Card className="max-w-2xl">
          <h2 className="mb-4 text-base font-semibold text-ink">
            {t("editTitle", { title: editing.title })}
          </h2>
          <BankOfferForm
            bankPartners={bankPartners}
            initial={editing}
            isBusy={busy}
            onCancel={() => {
              setEditing(null);
            }}
            onUpdate={async (body) => {
              await updateMutation.mutateAsync({ id: editing.id, body });
              setEditing(null);
            }}
          />
        </Card>
      ) : null}

      {filteredOffers.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t("empty")}</p>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-border">
          <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-3 py-2 font-medium">{t("columns.title")}</th>
                <th className="px-3 py-2 font-medium">{t("columns.bank")}</th>
                <th className="px-3 py-2 font-medium">{t("columns.rate")}</th>
                <th className="px-3 py-2 font-medium">{t("columns.publication")}</th>
                <th className="px-3 py-2 font-medium">{t("columns.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredOffers.map((offer) => (
                <tr key={offer.id} className="border-t border-border">
                  <td className="px-3 py-2.5 font-medium text-ink">{offer.title}</td>
                  <td className="px-3 py-2.5 text-ink-secondary">
                    {offer.partnerCompanyName ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 text-ink-secondary">{offer.rate}%</td>
                  <td className="px-3 py-2.5">
                    <PublicationStatusBadge status={offer.publicationStatus} />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="text-sm font-medium text-brand hover:underline"
                        onClick={() => {
                          setEditing(offer);
                          setCreating(false);
                        }}
                      >
                        {t("edit")}
                      </button>
                      <button
                        type="button"
                        className="text-sm font-medium text-danger hover:underline"
                        disabled={busy}
                        onClick={() => {
                          void deleteMutation.mutateAsync(offer.id);
                        }}
                      >
                        {t("delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
