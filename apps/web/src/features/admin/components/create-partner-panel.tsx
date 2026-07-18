"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { CompanyResponse } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import { useCreatePartnerMutation } from "@/features/admin/hooks/use-admin-partners";
import { PARTNER_COMPANY_TYPES } from "@/features/partners/constants";
import {
  createPartnerSchema,
  type CreatePartnerFormValues,
} from "@/features/partners/schemas/partner.schema";
import { toCreatePartnerBody } from "@/features/partners/utils/partner-mappers";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

type CreatePartnerPanelProps = {
  companies: CompanyResponse[];
  onClose: () => void;
};

/**
 * Dialog to create a partner profile for an existing company.
 */
export const CreatePartnerPanel = ({
  companies,
  onClose,
}: CreatePartnerPanelProps) => {
  const t = useTranslations("Admin.partners.create");
  const router = useRouter();
  const mutation = useCreatePartnerMutation();

  const compatibleCompanies = companies.filter((company) =>
    ["partner", "bank", "service"].includes(company.type),
  );

  const form = useForm<CreatePartnerFormValues>({
    resolver: zodResolver(createPartnerSchema),
    defaultValues: {
      companyId: "",
      type: "other",
      name: "",
      slug: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await mutation.mutateAsync(toCreatePartnerBody(values));
      onClose();
      router.push(`/admin/partners/${result.id}`);
    } catch {
      form.setError("root", { message: t("errors.generic") });
    }
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-partner-title"
      className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6"
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-t-lg bg-background p-5 shadow-lg sm:rounded-sm">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="create-partner-title" className="text-lg font-semibold text-ink">
            {t("title")}
          </h2>
          <button
            type="button"
            className="text-sm text-ink-muted hover:text-ink"
            onClick={onClose}
          >
            {t("cancel")}
          </button>
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <FormField
            id="companyId"
            label={t("company")}
            error={
              form.formState.errors.companyId ? t("validation.company") : undefined
            }
          >
            <select
              id="companyId"
              className="h-11 w-full rounded-sm border border-border bg-background px-3 text-sm text-ink"
              {...form.register("companyId")}
            >
              <option value="">{t("selectCompany")}</option>
              {compatibleCompanies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField id="type" label={t("type")}>
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

          <FormField
            id="name"
            label={t("name")}
            error={form.formState.errors.name ? t("validation.name") : undefined}
          >
            <Input id="name" {...form.register("name")} />
          </FormField>

          <FormField id="slug" label={t("slug")}>
            <Input id="slug" {...form.register("slug")} />
            <p className="mt-1 text-xs text-ink-muted">{t("slugHint")}</p>
          </FormField>

          {form.formState.errors.root?.message ? (
            <p role="alert" className="text-sm text-danger">
              {form.formState.errors.root.message}
            </p>
          ) : null}

          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? t("submitting") : t("submit")}
          </Button>
        </form>
      </div>
    </div>
  );
};
