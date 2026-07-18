"use client";

import type { AdminPartnerDetail } from "@toonexpo/contracts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm, type Control } from "react-hook-form";

import {
  useCreatePartnerOfferMutation,
  useDeletePartnerOfferMutation,
  useUpdatePartnerMutation,
  useUpdatePartnerOfferMutation,
  useAdminPartnerQuery,
} from "@/features/admin/hooks/use-admin-partners";
import {
  FeaturedBadge,
  PartnerStatusBadge,
  PublicationStatusBadge,
} from "@/features/partners/components/partner-badges";
import { PartnerOffersSection } from "@/features/partners/components/partner-offers-section";
import { PartnerProfileFields } from "@/features/partners/components/partner-profile-fields";
import { PartnerMediaFields } from "@/features/partners/components/partner-media-fields";
import type { PartnerMediaFieldValues } from "@/features/partners/components/partner-media-fields";
import { PartnerTypeLabel } from "@/features/partners/components/partner-type-label";
import {
  PARTNER_COMPANY_STATUSES,
  PARTNER_COMPANY_TYPES,
  PARTNER_PUBLICATION_STATUSES,
} from "@/features/partners/constants";
import {
  updatePartnerSchema,
  type UpdatePartnerFormValues,
} from "@/features/partners/schemas/partner.schema";
import { toUpdatePartnerFormValues } from "@/features/partners/utils/partner-form-values";
import { toUpdatePartnerBody } from "@/features/partners/utils/partner-mappers";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

type AdminPartnerDetailPageProps = {
  partnerId: string;
};

/**
 * Admin partner detail: profile, admin controls, offers CRUD.
 */
export const AdminPartnerDetailPage = ({
  partnerId,
}: AdminPartnerDetailPageProps) => {
  const t = useTranslations("Admin.partners.detail");
  const query = useAdminPartnerQuery(partnerId);

  if (query.isLoading) {
    return <p className="text-sm text-ink-secondary">{t("loading")}</p>;
  }

  if (query.isError || !query.data) {
    return (
      <div className="flex flex-col gap-3">
        <p role="alert" className="text-sm text-danger">
          {t("notFound")}
        </p>
        <Link
          href="/admin/partners"
          className="text-sm font-medium text-brand hover:underline"
        >
          {t("back")}
        </Link>
      </div>
    );
  }

  return <AdminPartnerDetailForm partnerId={partnerId} partner={query.data} />;
};

type AdminPartnerDetailFormProps = {
  partnerId: string;
  partner: AdminPartnerDetail;
};

const AdminPartnerDetailForm = ({
  partnerId,
  partner,
}: AdminPartnerDetailFormProps) => {
  const t = useTranslations("Admin.partners.detail");
  const updateMutation = useUpdatePartnerMutation(partnerId);
  const createOfferMutation = useCreatePartnerOfferMutation(partnerId);
  const updateOfferMutation = useUpdatePartnerOfferMutation(partnerId);
  const deleteOfferMutation = useDeletePartnerOfferMutation(partnerId);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const form = useForm<UpdatePartnerFormValues>({
    resolver: zodResolver(updatePartnerSchema),
    values: toUpdatePartnerFormValues(partner),
  });

  const busy =
    updateMutation.isPending ||
    createOfferMutation.isPending ||
    updateOfferMutation.isPending ||
    deleteOfferMutation.isPending;

  const onSubmit = form.handleSubmit(async (values) => {
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await updateMutation.mutateAsync(toUpdatePartnerBody(values));
      setSaveSuccess(true);
    } catch {
      setSaveError(t("errors.generic"));
    }
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Link
          href="/admin/partners"
          className="text-sm text-ink-secondary hover:text-ink"
        >
          {t("back")}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-ink">{partner.name}</h1>
          <PartnerTypeLabel
            type={partner.type}
            className="text-sm text-ink-secondary"
          />
          <PartnerStatusBadge status={partner.status} />
          <PublicationStatusBadge status={partner.publicationStatus} />
          <FeaturedBadge featured={partner.featured} />
        </div>
      </div>

      <form className="flex flex-col gap-6" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="name" label={t("form.name")}>
            <Input id="name" {...form.register("name")} />
          </FormField>
          <FormField id="slug" label={t("form.slug")}>
            <Input id="slug" {...form.register("slug")} />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField id="type" label={t("form.type")}>
            <select
              id="type"
              className="h-11 w-full rounded-sm border border-border bg-background px-3 text-sm text-ink"
              {...form.register("type")}
            >
              {PARTNER_COMPANY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`types.${type}`)}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="status" label={t("form.status")}>
            <select
              id="status"
              className="h-11 w-full rounded-sm border border-border bg-background px-3 text-sm text-ink"
              {...form.register("status")}
            >
              {PARTNER_COMPANY_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(`statuses.${status}`)}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="publicationStatus" label={t("form.publication")}>
            <select
              id="publicationStatus"
              className="h-11 w-full rounded-sm border border-border bg-background px-3 text-sm text-ink"
              {...form.register("publicationStatus")}
            >
              {PARTNER_PUBLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(`publicationStatuses.${status}`)}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="featured" label={t("form.featured")}>
            <label className="flex h-11 items-center gap-2 text-sm text-ink">
              <input type="checkbox" {...form.register("featured")} />
              {t("form.featuredLabel")}
            </label>
          </FormField>
        </div>

        <PartnerProfileFields
          register={form.register}
          errors={form.formState.errors}
        />

        <PartnerMediaFields
          control={form.control as unknown as Control<PartnerMediaFieldValues>}
          context="admin"
        />

        {saveError ? (
          <p role="alert" className="text-sm text-danger">
            {saveError}
          </p>
        ) : null}
        {saveSuccess ? (
          <p className="text-sm text-success">{t("saveSuccess")}</p>
        ) : null}

        <Button type="submit" disabled={busy || !form.formState.isDirty}>
          {busy ? t("saving") : t("save")}
        </Button>
      </form>

      <PartnerOffersSection
        offers={partner.offers}
        isBusy={busy}
        onCreate={async (body) => {
          await createOfferMutation.mutateAsync(body);
        }}
        onUpdate={async (offerId, body) => {
          await updateOfferMutation.mutateAsync({ offerId, body });
        }}
        onDelete={async (offerId) => {
          await deleteOfferMutation.mutateAsync(offerId);
        }}
      />
    </div>
  );
};
