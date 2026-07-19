"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useCreateBuyerRequestMutation } from "@/features/buyer/hooks/use-buyer";
import {
  createRequestNoteSchema,
  toCreateBuyerRequestBody,
  type CreateRequestNoteValues,
} from "@/features/buyer/schemas/create-request.schema";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Textarea } from "@/shared/ui/textarea";

type RequestFormPanelProps = {
  projectId: string;
  apartmentId?: string | undefined;
  onClose: () => void;
};

type SuccessKind = "created" | "deduplicated";

/**
 * Modal panel: optional note → POST /requests.
 */
export const RequestFormPanel = ({
  projectId,
  apartmentId,
  onClose,
}: RequestFormPanelProps) => {
  const t = useTranslations("Catalog.request");
  const mutation = useCreateBuyerRequestMutation();
  const [success, setSuccess] = useState<SuccessKind | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateRequestNoteValues>({
    resolver: zodResolver(createRequestNoteSchema),
    defaultValues: { note: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const result = await mutation.mutateAsync(
        toCreateBuyerRequestBody({
          projectId,
          apartmentId,
          note: values.note,
        }),
      );
      setSuccess(result.deduplicated ? "deduplicated" : "created");
    } catch {
      setFormError(t("errors.generic"));
    }
  });

  const busy = isSubmitting || mutation.isPending;

  if (success) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink" role="status">
          {success === "deduplicated"
            ? t("success.deduplicated")
            : t("success.created")}
        </p>
        <Button type="button" variant="secondary" onClick={onClose}>
          {t("close")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <FormField
        id="request-note"
        label={t("noteLabel")}
        error={errors.note ? t("validation.note") : undefined}
      >
        <Textarea
          id="request-note"
          placeholder={t("notePlaceholder")}
          aria-invalid={Boolean(errors.note)}
          {...register("note")}
        />
      </FormField>

      {formError ? (
        <p role="alert" className="text-sm text-danger">
          {formError}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" disabled={busy} className="w-full sm:w-auto">
          {busy ? t("submitting") : t("submit")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="w-full sm:w-auto"
        >
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
};
