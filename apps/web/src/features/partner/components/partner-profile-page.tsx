"use client";

import type { PortalPartnerDetail } from "@toonexpo/contracts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm, type Control } from "react-hook-form";

import {
  usePortalPartnerQuery,
  useUpdatePortalPartnerMutation,
} from "@/features/partner/hooks/use-portal-partner";
import {
  FeaturedBadge,
  PartnerStatusBadge,
  PublicationStatusBadge,
} from "@/features/partners/components/partner-badges";
import { PartnerProfileFields } from "@/features/partners/components/partner-profile-fields";
import { PartnerMediaFields } from "@/features/partners/components/partner-media-fields";
import type { PartnerMediaFieldValues } from "@/features/partners/components/partner-media-fields";
import { PartnerTypeLabel } from "@/features/partners/components/partner-type-label";
import {
  partnerProfileSchema,
  type PartnerProfileFormValues,
} from "@/features/partners/schemas/partner.schema";
import { toPartnerProfileFormValues } from "@/features/partners/utils/partner-form-values";
import { toUpdatePortalPartnerBody } from "@/features/partners/utils/partner-mappers";
import { Button } from "@/shared/ui/button";

/**
 * Partner portal profile page with read-only admin fields.
 */
export const PartnerProfilePage = () => {
  const t = useTranslations("Partner.profile");
  const query = usePortalPartnerQuery();

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

  return <PartnerProfileForm partner={query.data} />;
};

type PartnerProfileFormProps = {
  partner: PortalPartnerDetail;
};

const PartnerProfileForm = ({ partner }: PartnerProfileFormProps) => {
  const t = useTranslations("Partner.profile");
  const tPartners = useTranslations("Partners");
  const updateMutation = useUpdatePortalPartnerMutation();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const form = useForm<PartnerProfileFormValues>({
    resolver: zodResolver(partnerProfileSchema),
    values: toPartnerProfileFormValues(partner),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await updateMutation.mutateAsync(toUpdatePortalPartnerBody(values));
      setSaveSuccess(true);
    } catch {
      setSaveError(t("errors.generic"));
    }
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-ink">{partner.name}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <PartnerTypeLabel type={partner.type} className="text-sm text-ink-secondary" />
          <PartnerStatusBadge status={partner.status} />
          <PublicationStatusBadge status={partner.publicationStatus} />
          <FeaturedBadge featured={partner.featured} />
        </div>
        <p className="text-sm text-ink-secondary">
          {t("slugLabel")}: {partner.slug}
        </p>
      </div>

      <form className="flex flex-col gap-6" onSubmit={onSubmit}>
        <PartnerProfileFields
          register={form.register}
          errors={form.formState.errors}
          readOnlyMeta
          meta={{
            type: tPartners(`types.${partner.type}`),
            slug: partner.slug,
            status: tPartners(`companyStatus.${partner.status}`),
            publicationStatus: tPartners(`publication.${partner.publicationStatus}`),
            featured: partner.featured,
          }}
        />

        <PartnerMediaFields
          control={form.control as unknown as Control<PartnerMediaFieldValues>}
          context="portal"
        />

        {saveError ? (
          <p role="alert" className="text-sm text-danger">
            {saveError}
          </p>
        ) : null}
        {saveSuccess ? (
          <p className="text-sm text-success">{t("saveSuccess")}</p>
        ) : null}

        <Button
          type="submit"
          disabled={updateMutation.isPending || !form.formState.isDirty}
        >
          {updateMutation.isPending ? t("saving") : t("save")}
        </Button>
      </form>
    </div>
  );
};
