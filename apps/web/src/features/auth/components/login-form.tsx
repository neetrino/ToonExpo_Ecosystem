"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useLoginMutation } from "@/features/auth/hooks/use-auth";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login.schema";
import { mapAuthError } from "@/features/auth/utils/map-auth-error";
import { sanitizeReturnUrl } from "@/features/auth/utils/sanitize-return-url";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

type LoginFormProps = {
  returnUrl?: string | undefined;
};

/**
 * Email/password login form with NestJS-backed session cookie.
 */
export const LoginForm = ({ returnUrl }: LoginFormProps) => {
  const t = useTranslations("Auth");
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const safeReturn = sanitizeReturnUrl(returnUrl);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await loginMutation.mutateAsync(values);
      router.push(safeReturn);
    } catch (error) {
      setFormError(t(`errors.${mapAuthError(error)}`));
    }
  });

  const busy = isSubmitting || loginMutation.isPending;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <FormField
        id="login-email"
        label={t("fields.email")}
        error={errors.email ? t("validation.email") : undefined}
      >
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
      </FormField>

      <FormField
        id="login-password"
        label={t("fields.password")}
        error={errors.password ? t("validation.password") : undefined}
      >
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
      </FormField>

      {formError ? (
        <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2 text-sm text-danger">
          {formError}
        </p>
      ) : null}

      <Button type="submit" variant="secondary" disabled={busy} className="w-full">
        {busy ? t("login.submitting") : t("login.submit")}
      </Button>

      <p className="text-center text-sm text-ink-secondary">
        {t("login.noAccount")}{" "}
        <Link href="/auth/register" className="font-medium text-brand hover:underline">
          {t("login.registerLink")}
        </Link>
      </p>
    </form>
  );
};
