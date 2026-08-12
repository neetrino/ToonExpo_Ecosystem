"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { useResendAdminInviteMutation } from "@/features/admin/hooks/use-admin-companies";
import { ApiError } from "@/shared/api/errors";
import { Button } from "@/shared/ui/button";
import { useSuccessToast } from "@/shared/ui/use-success-toast";

type ResendInviteButtonProps = {
  companyId: string;
};

/**
 * Confirm + resend set-password invite with success toast.
 */
export const ResendInviteButton = ({ companyId }: ResendInviteButtonProps) => {
  const t = useTranslations("Admin.companies");
  const resendMutation = useResendAdminInviteMutation(companyId);
  const [toast, setToast] = useState<"error" | "notFound" | null>(null);
  const { showSuccess, successToast } = useSuccessToast();

  const onClick = () => {
    if (!window.confirm(t("detail.resendConfirm"))) {
      return;
    }

    setToast(null);
    void resendMutation
      .mutateAsync()
      .then(() => {
        showSuccess(t("detail.resendSuccess"));
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 404) {
          setToast("notFound");
          return;
        }
        setToast("error");
      });
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={resendMutation.isPending}
        onClick={onClick}
      >
        {resendMutation.isPending
          ? t("detail.resendSubmitting")
          : t("detail.resendInvite")}
      </Button>
      {successToast}
      {toast === "notFound" ? (
        <p role="alert" className="text-sm text-danger">
          {t("detail.resendNotFound")}
        </p>
      ) : null}
      {toast === "error" ? (
        <p role="alert" className="text-sm text-danger">
          {t("errors.generic")}
        </p>
      ) : null}
    </div>
  );
};
