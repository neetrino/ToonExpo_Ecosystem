"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { PartnerOfferItem } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { TranslationTabs } from "@/features/builder/components/translation-tabs";
import { PARTNER_PUBLICATION_STATUSES } from "@/features/partners/constants";
import {
  partnerOfferSchema,
  type PartnerOfferFormValues,
} from "@/features/partners/schemas/partner.schema";
import { toPartnerOfferFormValues } from "@/features/partners/utils/partner-form-values";
import {
  toCreatePartnerOfferBody,
  toUpdatePartnerOfferBody,
} from "@/features/partners/utils/partner-mappers";
import { PublicationStatusBadge } from "@/features/partners/components/partner-badges";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

type PartnerOffersSectionProps = {
  offers: PartnerOfferItem[];
  onCreate: (body: ReturnType<typeof toCreatePartnerOfferBody>) => Promise<void>;
  onUpdate: (
    offerId: string,
    body: ReturnType<typeof toUpdatePartnerOfferBody>,
  ) => Promise<void>;
  onDelete: (offerId: string) => Promise<void>;
  isBusy?: boolean | undefined;
};

/**
 * CRUD list for partner offers with locale tabs per offer form.
 */
export const PartnerOffersSection = ({
  offers,
  onCreate,
  onUpdate,
  onDelete,
  isBusy = false,
}: PartnerOffersSectionProps) => {
  const t = useTranslations("Partners.offers");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">{t("title")}</h2>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => {
            setEditingId(null);
            setShowCreate(true);
          }}
        >
          {t("add")}
        </Button>
      </div>

      {offers.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {offers.map((offer) => (
            <li
              key={offer.id}
              className="rounded-sm border border-border bg-surface p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{offer.title}</p>
                  {offer.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-ink-secondary">
                      {offer.description}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <PublicationStatusBadge status={offer.publicationStatus} />
                    <span className="text-xs text-ink-muted">
                      {t("sortOrder", { value: offer.sortOrder })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowCreate(false);
                      setEditingId(offer.id);
                    }}
                  >
                    {t("edit")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={isBusy}
                    onClick={() => {
                      void onDelete(offer.id);
                    }}
                  >
                    {t("delete")}
                  </Button>
                </div>
              </div>

              {editingId === offer.id ? (
                <div className="mt-4 border-t border-border pt-4">
                  <PartnerOfferForm
                    key={offer.id}
                    defaultValues={toPartnerOfferFormValues(offer)}
                    submitLabel={t("save")}
                    onCancel={() => {
                      setEditingId(null);
                    }}
                    onSubmit={async (values) => {
                      await onUpdate(offer.id, toUpdatePartnerOfferBody(values));
                      setEditingId(null);
                    }}
                    isBusy={isBusy}
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {showCreate ? (
        <div className="rounded-sm border border-border bg-background p-4">
          <PartnerOfferForm
            defaultValues={{
              titleHy: "",
              titleRu: "",
              titleEn: "",
              descriptionHy: "",
              descriptionRu: "",
              descriptionEn: "",
              publicationStatus: "draft",
              sortOrder: offers.length,
            }}
            submitLabel={t("create")}
            onCancel={() => {
              setShowCreate(false);
            }}
            onSubmit={async (values) => {
              await onCreate(toCreatePartnerOfferBody(values));
              setShowCreate(false);
            }}
            isBusy={isBusy}
          />
        </div>
      ) : null}
    </section>
  );
};

type PartnerOfferFormProps = {
  defaultValues: PartnerOfferFormValues;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (values: PartnerOfferFormValues) => Promise<void>;
  isBusy: boolean;
};

const PartnerOfferForm = ({
  defaultValues,
  submitLabel,
  onCancel,
  onSubmit,
  isBusy,
}: PartnerOfferFormProps) => {
  const t = useTranslations("Partners.offers");
  const form = useForm<PartnerOfferFormValues>({
    resolver: zodResolver(partnerOfferSchema),
    defaultValues,
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <TranslationTabs>
        {(locale) => (
          <div className="flex flex-col gap-4">
            <FormField
              id={`offer-title-${locale}`}
              label={t("fields.title")}
              error={
                locale === "hy" && form.formState.errors.titleHy
                  ? t("validation.title")
                  : undefined
              }
            >
              <Input
                id={`offer-title-${locale}`}
                {...form.register(
                  locale === "hy"
                    ? "titleHy"
                    : locale === "ru"
                      ? "titleRu"
                      : "titleEn",
                )}
              />
            </FormField>
            <FormField id={`offer-desc-${locale}`} label={t("fields.description")}>
              <Textarea
                id={`offer-desc-${locale}`}
                rows={4}
                {...form.register(
                  locale === "hy"
                    ? "descriptionHy"
                    : locale === "ru"
                      ? "descriptionRu"
                      : "descriptionEn",
                )}
              />
            </FormField>
          </div>
        )}
      </TranslationTabs>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="offerPublication" label={t("fields.publication")}>
          <select
            id="offerPublication"
            className="h-11 w-full rounded-sm border border-border bg-background px-3 text-sm text-ink"
            {...form.register("publicationStatus")}
          >
            {PARTNER_PUBLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(`publication.${status}`)}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id="offerSort" label={t("fields.sortOrder")}>
          <Input
            id="offerSort"
            type="number"
            min={0}
            max={9999}
            {...form.register("sortOrder", { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={isBusy || form.formState.isSubmitting}>
          {submitLabel}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
};
