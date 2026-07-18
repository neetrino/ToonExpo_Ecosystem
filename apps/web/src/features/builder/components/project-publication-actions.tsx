"use client";

import type { PortalProjectDetail } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useIsCompanyAdminQuery } from "@/features/builder/hooks/use-company-members";
import {
  useDeletePortalProjectMutation,
  useUpdateProjectPublicationMutation,
} from "@/features/builder/hooks/use-portal-projects";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";

type ProjectPublicationActionsProps = {
  project: PortalProjectDetail;
};

/**
 * Publish / archive / delete controls for company_admin.
 */
export const ProjectPublicationActions = ({
  project,
}: ProjectPublicationActionsProps) => {
  const t = useTranslations("Builder.projects");
  const router = useRouter();
  const adminQuery = useIsCompanyAdminQuery();
  const publicationMutation = useUpdateProjectPublicationMutation(project.id);
  const deleteMutation = useDeletePortalProjectMutation();
  const [toast, setToast] = useState<"success" | "error" | null>(null);

  if (!adminQuery.data) {
    return null;
  }

  const busy = publicationMutation.isPending || deleteMutation.isPending;

  const changeStatus = async (publicationStatus: "published" | "archived") => {
    setToast(null);
    try {
      await publicationMutation.mutateAsync({ publicationStatus });
      setToast("success");
    } catch {
      setToast("error");
    }
  };

  const onDelete = async () => {
    if (!window.confirm(t("detail.deleteConfirm"))) {
      return;
    }
    setToast(null);
    try {
      await deleteMutation.mutateAsync(project.id);
      router.push("/builder/projects");
    } catch {
      setToast("error");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {project.publicationStatus !== "published" ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => {
              void changeStatus("published");
            }}
          >
            {t("detail.publish")}
          </Button>
        ) : null}
        {project.publicationStatus !== "archived" ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => {
              void changeStatus("archived");
            }}
          >
            {t("detail.archive")}
          </Button>
        ) : null}
        {project.publicationStatus === "draft" ? (
          <Button
            type="button"
            size="sm"
            variant="danger"
            disabled={busy}
            onClick={() => {
              void onDelete();
            }}
          >
            {t("detail.delete")}
          </Button>
        ) : null}
      </div>
      {toast === "success" ? (
        <p role="status" className="text-sm text-success">
          {t("detail.publicationSuccess")}
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
