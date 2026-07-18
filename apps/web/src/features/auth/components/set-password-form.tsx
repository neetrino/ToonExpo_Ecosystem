"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useSetPasswordMutation } from "@/features/auth/hooks/use-auth";
import {
  setPasswordSchema,
  type SetPasswordFormValues,
} from "@/features/auth/schemas/set-password.schema";
import { mapSetPasswordError } from "@/features/auth/utils/map-auth-error";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

type SetPasswordFormProps = {
  token: string;
};

/**
 * Invite-token password form; on success the user is already sessioned.
 */
export const SetPasswordForm = ({ token }: SetPasswordFormProps) => {
  const t = useTranslations("Auth");
  const router = useRouter();
  const setPasswordMutation = useSetPasswordMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await setPasswordMutation.mutateAsync({
        token,
        password: values.password,
      });
      router.push("/profile");
    } catch (error) {
      setFormError(t(`errors.${mapSetPasswordError(error)}`));
    }
  });

  const busy = isSubmitting || setPasswordMutation.isPending;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <FormField
        id="set-password"
        label={t("fields.password")}
        error={errors.password ? t("validation.password") : undefined}
      >
        <Input
          id="set-password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
      </FormField>

      <FormField
        id="set-password-confirm"
        label={t("fields.confirmPassword")}
        error={
          errors.confirmPassword
            ? t("validation.confirmPassword")
            : undefined
        }
      >
        <Input
          id="set-password-confirm"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register("confirmPassword")}
        />
      </FormField>

      {formError ? (
        <div
          role="alert"
          className="flex flex-col gap-1 rounded-sm bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          <p>{formError}</p>
          <p className="text-ink-secondary">{t("setPassword.supportHint")}</p>
        </div>
      ) : null}

      <Button type="submit" variant="secondary" disabled={busy} className="w-full">
        {busy ? t("setPassword.submitting") : t("setPassword.submit")}
      </Button>
    </form>
  );
};
