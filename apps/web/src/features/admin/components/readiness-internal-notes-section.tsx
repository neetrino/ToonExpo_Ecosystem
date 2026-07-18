"use client";

import type { ReadinessInternalNoteItem } from "@toonexpo/contracts";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import {
  useCreateReadinessInternalNoteMutation,
  useDeleteReadinessInternalNoteMutation,
} from "@/features/admin/hooks/use-admin-readiness";
import { formatReadinessDate } from "@/features/readiness/utils/format-readiness-date";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Textarea } from "@/shared/ui/textarea";

type ReadinessInternalNotesSectionProps = {
  assessmentId: string;
  notes: ReadinessInternalNoteItem[];
};

/**
 * Internal-only notes section (clearly marked for admin eyes only).
 */
export const ReadinessInternalNotesSection = ({
  assessmentId,
  notes,
}: ReadinessInternalNotesSectionProps) => {
  const t = useTranslations("Admin.readiness.detail.internalNotes");
  const locale = useLocale();
  const createMutation = useCreateReadinessInternalNoteMutation(assessmentId);
  const deleteMutation = useDeleteReadinessInternalNoteMutation(assessmentId);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onAdd = async () => {
    setError(null);
    if (!body.trim()) {
      setError(t("validation.required"));
      return;
    }
    try {
      await createMutation.mutateAsync({ body: body.trim() });
      setBody("");
    } catch {
      setError(t("errors.generic"));
    }
  };

  const onDelete = async (noteId: string) => {
    if (!window.confirm(t("deleteConfirm"))) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(noteId);
    } catch {
      setError(t("errors.generic"));
    }
  };

  return (
    <section className="flex flex-col gap-4 rounded-sm border border-warning/30 bg-warning/5 p-4">
      <div>
        <h2 className="text-base font-semibold text-ink">{t("title")}</h2>
        <p className="mt-1 text-sm text-ink-muted">{t("subtitle")}</p>
      </div>

      <ul className="flex flex-col gap-3">
        {notes.map((note) => (
          <li
            key={note.id}
            className="rounded-sm border border-border bg-background p-3"
          >
            <p className="whitespace-pre-wrap text-sm text-ink">{note.body}</p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-ink-muted">
                {formatReadinessDate(note.createdAt, locale)}
              </span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  void onDelete(note.id);
                }}
              >
                {t("delete")}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <FormField id="internal-note" label={t("addLabel")}>
        <Textarea
          id="internal-note"
          rows={3}
          value={body}
          onChange={(event) => {
            setBody(event.target.value);
          }}
        />
      </FormField>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <Button
        type="button"
        size="sm"
        disabled={createMutation.isPending}
        onClick={() => {
          void onAdd();
        }}
      >
        {createMutation.isPending ? t("adding") : t("add")}
      </Button>
    </section>
  );
};
