"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useRegisterMutation } from "@/features/auth/hooks/use-auth";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas/register.schema";
import { mapAuthError } from "@/features/auth/utils/map-auth-error";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

/**
 * Buyer self-registration form with NestJS-backed session cookie.
 */
export const RegisterForm = () => {
  const t = useTranslations("Auth");
  const router = useRouter();
  const registerMutation = useRegisterMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await registerMutation.mutateAsync(values);
      router.push("/profile");
    } catch (error) {
      setFormError(t(`errors.${mapAuthError(error)}`));
    }
  });

  const busy = isSubmitting || registerMutation.isPending;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <FormField
        id="register-name"
        label={t("fields.name")}
        error={errors.name ? t("validation.name") : undefined}
      >
        <Input
          id="register-name"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
      </FormField>

      <FormField
        id="register-email"
        label={t("fields.email")}
        error={errors.email ? t("validation.email") : undefined}
      >
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
      </FormField>

      <FormField
        id="register-phone"
        label={t("fields.phone")}
        error={errors.phone ? t("validation.phone") : undefined}
      >
        <Input
          id="register-phone"
          type="tel"
          autoComplete="tel"
          aria-invalid={Boolean(errors.phone)}
          {...register("phone")}
        />
      </FormField>

      <FormField
        id="register-password"
        label={t("fields.password")}
        error={errors.password ? t("validation.password") : undefined}
      >
        <Input
          id="register-password"
          type="password"
          autoComplete="new-password"
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
        {busy ? t("register.submitting") : t("register.submit")}
      </Button>

      <p className="text-center text-sm text-ink-secondary">
        {t("register.hasAccount")}{" "}
        <Link href="/auth/login" className="font-medium text-brand hover:underline">
          {t("register.loginLink")}
        </Link>
      </p>
    </form>
  );
};
