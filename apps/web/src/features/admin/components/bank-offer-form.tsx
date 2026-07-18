"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { BankOfferListItem } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import {
  bankOfferFormSchema,
  termOptionsToField,
  type BankOfferFormInput,
  type BankOfferFormValues,
} from "@/features/admin/schemas/bank-offer.schema";
import {
  toCreateBankOfferBody,
  toUpdateBankOfferBody,
} from "@/features/admin/utils/bank-offer-mappers";
import { PARTNER_PUBLICATION_STATUSES } from "@/features/partners/constants";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

type BankPartnerOption = {
  companyId: string;
  name: string;
};

type BankOfferFormProps = {
  bankPartners: BankPartnerOption[];
  initial?: BankOfferListItem | undefined;
  onCreate?: ((body: ReturnType<typeof toCreateBankOfferBody>) => Promise<void>) | undefined;
  onUpdate?: ((body: ReturnType<typeof toUpdateBankOfferBody>) => Promise<void>) | undefined;
  onCancel: () => void;
  isBusy: boolean;
};

/**
 * Admin create/edit form for bank mortgage offers.
 */
export const BankOfferForm = ({
  bankPartners,
  initial,
  onCreate,
  onUpdate,
  onCancel,
  isBusy,
}: BankOfferFormProps) => {
  const t = useTranslations("Admin.bankOffers.form");
  const isEdit = initial != null;

  const form = useForm<BankOfferFormInput, unknown, BankOfferFormValues>({
    resolver: zodResolver(bankOfferFormSchema),
    defaultValues: initial
      ? {
          partnerCompanyId: initial.partnerCompanyId,
          title: initial.title,
          shortDescription: initial.shortDescription ?? "",
          rate: Number(initial.rate),
          apr: initial.apr != null ? Number(initial.apr) : undefined,
          minDownPaymentPercent: Number(initial.minDownPaymentPercent),
          termOptionsYears: termOptionsToField(initial.termOptionsYears),
          fees: initial.fees ?? "",
          calculationNotes: initial.calculationNotes ?? "",
          featured: initial.featured,
          sortOrder: initial.sortOrder,
          publicationStatus: initial.publicationStatus,
        }
      : {
          partnerCompanyId: bankPartners[0]?.companyId ?? "",
          title: "",
          shortDescription: "",
          rate: 0,
          minDownPaymentPercent: 10,
          termOptionsYears: "15, 20, 30",
          fees: "",
          calculationNotes: "",
          featured: false,
          sortOrder: 0,
          publicationStatus: "draft",
        },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    if (isEdit) {
      await onUpdate?.(
        toUpdateBankOfferBody({
          title: values.title,
          shortDescription: values.shortDescription,
          rate: values.rate,
          apr: values.apr,
          minDownPaymentPercent: values.minDownPaymentPercent,
          termOptionsYears: values.termOptionsYears,
          fees: values.fees,
          calculationNotes: values.calculationNotes,
          featured: values.featured,
          sortOrder: values.sortOrder,
          publicationStatus: values.publicationStatus,
        }),
      );
      return;
    }
    await onCreate?.(toCreateBankOfferBody(values));
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {!isEdit ? (
        <FormField id="partnerCompanyId" label={t("bankPartner")}>
          <select
            id="partnerCompanyId"
            className="h-11 w-full rounded-sm border border-border bg-background px-3 text-sm text-ink"
            {...form.register("partnerCompanyId")}
          >
            {bankPartners.map((partner) => (
              <option key={partner.companyId} value={partner.companyId}>
                {partner.name}
              </option>
            ))}
          </select>
        </FormField>
      ) : null}

      <FormField id="title" label={t("title")}>
        <Input id="title" {...form.register("title")} />
      </FormField>

      <FormField id="shortDescription" label={t("shortDescription")}>
        <Textarea id="shortDescription" rows={3} {...form.register("shortDescription")} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="rate" label={t("rate")}>
          <Input id="rate" type="number" step="0.01" {...form.register("rate", { valueAsNumber: true })} />
        </FormField>
        <FormField id="apr" label={t("apr")}>
          <Input id="apr" type="number" step="0.01" {...form.register("apr", { valueAsNumber: true })} />
        </FormField>
        <FormField id="minDownPaymentPercent" label={t("minDownPayment")}>
          <Input
            id="minDownPaymentPercent"
            type="number"
            step="0.01"
            {...form.register("minDownPaymentPercent", { valueAsNumber: true })}
          />
        </FormField>
        <FormField id="termOptionsYears" label={t("termOptions")}>
          <Input id="termOptionsYears" {...form.register("termOptionsYears")} />
        </FormField>
      </div>

      <FormField id="fees" label={t("fees")}>
        <Textarea id="fees" rows={2} {...form.register("fees")} />
      </FormField>

      <FormField id="calculationNotes" label={t("calculationNotes")}>
        <Textarea id="calculationNotes" rows={2} {...form.register("calculationNotes")} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="publicationStatus" label={t("publication")}>
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
        <FormField id="sortOrder" label={t("sortOrder")}>
          <Input id="sortOrder" type="number" {...form.register("sortOrder", { valueAsNumber: true })} />
        </FormField>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" {...form.register("featured")} />
        {t("featured")}
      </label>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={isBusy || form.formState.isSubmitting}>
          {isEdit ? t("save") : t("create")}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
};
