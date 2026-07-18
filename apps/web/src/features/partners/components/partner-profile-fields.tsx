"use client";

import { useTranslations } from "next-intl";
import type { UseFormRegister, FieldErrors } from "react-hook-form";

import { TranslationTabs } from "@/features/builder/components/translation-tabs";
import type {
  PartnerProfileFormValues,
  UpdatePartnerFormValues,
} from "@/features/partners/schemas/partner.schema";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

type ProfileFormValues = PartnerProfileFormValues | UpdatePartnerFormValues;

type PartnerProfileFieldsProps = {
  register: UseFormRegister<ProfileFormValues>;
  errors: FieldErrors<ProfileFormValues>;
  readOnlyMeta?: boolean | undefined;
  meta?: {
    type: string;
    slug: string;
    status: string;
    publicationStatus: string;
    featured: boolean;
  };
};

/**
 * Shared profile fields: descriptions per locale, contacts, website, social links.
 */
export const PartnerProfileFields = ({
  register,
  errors,
  readOnlyMeta = false,
  meta,
}: PartnerProfileFieldsProps) => {
  const t = useTranslations("Partners.form");

  return (
    <div className="flex flex-col gap-6">
      {readOnlyMeta && meta ? (
        <dl className="grid gap-3 rounded-sm border border-border bg-surface p-4 text-sm sm:grid-cols-2">
          <MetaRow label={t("type")} value={meta.type} />
          <MetaRow label={t("slug")} value={meta.slug} />
          <MetaRow label={t("status")} value={meta.status} />
          <MetaRow label={t("publication")} value={meta.publicationStatus} />
          <MetaRow
            label={t("featured")}
            value={meta.featured ? t("featuredYes") : t("featuredNo")}
          />
        </dl>
      ) : null}

      <TranslationTabs>
        {(locale) => (
          <div className="flex flex-col gap-4">
            <FormField
              id={`short-${locale}`}
              label={t("shortDescription")}
              error={
                locale === "hy" && errors.shortDescriptionHy
                  ? t("validation.shortDescription")
                  : undefined
              }
            >
              <Textarea
                id={`short-${locale}`}
                rows={3}
                {...register(
                  locale === "hy"
                    ? "shortDescriptionHy"
                    : locale === "ru"
                      ? "shortDescriptionRu"
                      : "shortDescriptionEn",
                )}
              />
            </FormField>
            <FormField id={`full-${locale}`} label={t("fullDescription")}>
              <Textarea
                id={`full-${locale}`}
                rows={6}
                {...register(
                  locale === "hy"
                    ? "fullDescriptionHy"
                    : locale === "ru"
                      ? "fullDescriptionRu"
                      : "fullDescriptionEn",
                )}
              />
            </FormField>
          </div>
        )}
      </TranslationTabs>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="contactPhone" label={t("contactPhone")}>
          <Input id="contactPhone" {...register("contactPhone")} />
        </FormField>
        <FormField id="contactEmail" label={t("contactEmail")}>
          <Input id="contactEmail" type="email" {...register("contactEmail")} />
        </FormField>
      </div>

      <FormField id="website" label={t("website")}>
        <Input id="website" type="url" {...register("website")} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField id="socialFacebook" label={t("socialFacebook")}>
          <Input id="socialFacebook" {...register("socialFacebook")} />
        </FormField>
        <FormField id="socialInstagram" label={t("socialInstagram")}>
          <Input id="socialInstagram" {...register("socialInstagram")} />
        </FormField>
        <FormField id="socialLinkedin" label={t("socialLinkedin")}>
          <Input id="socialLinkedin" {...register("socialLinkedin")} />
        </FormField>
      </div>
    </div>
  );
};

const MetaRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-0.5">
    <dt className="text-xs uppercase tracking-wide text-ink-muted">{label}</dt>
    <dd className="font-medium text-ink">{value}</dd>
  </div>
);
