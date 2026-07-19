"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { COMPANY_MEMBER_ROLES } from "@/features/builder/constants";
import { useInviteMemberMutation } from "@/features/builder/hooks/use-company-members";
import {
  inviteMemberSchema,
  type InviteMemberFormValues,
} from "@/features/builder/schemas/team.schema";
import { ApiError } from "@/shared/api/errors";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

type InviteMemberFormProps = {
  onSuccess: (email: string) => void;
};

const mapInviteError = (error: unknown): "emailTaken" | "generic" => {
  if (error instanceof ApiError && error.status === 409) {
    return "emailTaken";
  }
  return "generic";
};

/**
 * Invite form for company_admin team management.
 */
export const InviteMemberForm = ({ onSuccess }: InviteMemberFormProps) => {
  const t = useTranslations("Builder.team");
  const locale = useLocale();
  const mutation = useInviteMemberMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "member",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await mutation.mutateAsync({
        name: values.name,
        email: values.email,
        role: values.role,
        locale,
        ...(values.phone.length > 0 ? { phone: values.phone } : {}),
      });
      reset();
      onSuccess(values.email);
    } catch (error) {
      setFormError(t(`errors.${mapInviteError(error)}`));
    }
  });

  const busy = isSubmitting || mutation.isPending;
  const selectClassName =
    "h-11 w-full rounded-sm border border-border bg-background px-4 text-sm text-ink focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <FormField
        id="invite-name"
        label={t("form.name")}
        error={errors.name ? t("validation.name") : undefined}
      >
        <Input id="invite-name" {...register("name")} />
      </FormField>
      <FormField
        id="invite-email"
        label={t("form.email")}
        error={errors.email ? t("validation.email") : undefined}
      >
        <Input id="invite-email" type="email" {...register("email")} />
      </FormField>
      <FormField
        id="invite-phone"
        label={t("form.phone")}
        error={errors.phone ? t("validation.phone") : undefined}
      >
        <Input id="invite-phone" type="tel" {...register("phone")} />
      </FormField>
      <FormField id="invite-role" label={t("form.role")}>
        <select id="invite-role" className={selectClassName} {...register("role")}>
          {COMPANY_MEMBER_ROLES.map((role) => (
            <option key={role} value={role}>
              {t(`roles.${role}`)}
            </option>
          ))}
        </select>
      </FormField>
      {formError ? (
        <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2 text-sm text-danger">
          {formError}
        </p>
      ) : null}
      <Button type="submit" variant="secondary" disabled={busy}>
        {busy ? t("form.submitting") : t("form.submit")}
      </Button>
    </form>
  );
};
