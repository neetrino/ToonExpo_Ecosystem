"use client";

import { useTranslations } from "next-intl";

import { PartnerBankOffersSection } from "@/features/partner/components/partner-bank-offers-section";
import {
  useCreatePortalBankOfferMutation,
  useDeletePortalBankOfferMutation,
  usePortalBankOffersQuery,
  useUpdatePortalBankOfferMutation,
} from "@/features/partner/hooks/use-portal-bank-offers";

/**
 * Bank partner portal mortgage offers page.
 */
export const PartnerBankOffersPage = () => {
  const t = useTranslations("Partner.bankOffers");
  const query = usePortalBankOffersQuery();
  const createMutation = useCreatePortalBankOfferMutation();
  const updateMutation = useUpdatePortalBankOfferMutation();
  const deleteMutation = useDeletePortalBankOfferMutation();

  if (query.isLoading) {
    return <p className="text-sm text-ink-secondary">{t("loading")}</p>;
  }

  if (query.isError || !query.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t("error")}
      </p>
    );
  }

  const busy =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <PartnerBankOffersSection
      offers={query.data.data}
      isBusy={busy}
      onCreate={async (body) => {
        await createMutation.mutateAsync(body);
      }}
      onUpdate={async (id, body) => {
        await updateMutation.mutateAsync({ id, body });
      }}
      onDelete={async (id) => {
        await deleteMutation.mutateAsync(id);
      }}
    />
  );
};
