"use client";

import type { CrmDealDetail } from "@toonexpo/contracts";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { useAddCrmNoteMutation } from "@/features/builder/hooks/use-portal-crm";
import { formatBuyerDateTime } from "@/features/buyer/utils/format-datetime";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";

type CrmDealNotesSectionProps = {
  deal: CrmDealDetail;
};

/**
 * Internal notes feed + add form.
 */
export const CrmDealNotesSection = ({ deal }: CrmDealNotesSectionProps) => {
  const t = useTranslations("Builder.crm.detail");
  const locale = useLocale();
  const mutation = useAddCrmNoteMutation(deal.id);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    const trimmed = body.trim();
    if (!trimmed) {
      return;
    }
    setError(null);
    try {
      await mutation.mutateAsync({ body: trimmed });
      setBody("");
    } catch {
      setError(t("errors.generic"));
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-sm border border-border p-4">
      <h2 className="text-sm font-semibold text-ink">{t("notesTitle")}</h2>

      {deal.notes.length === 0 ? (
        <p className="text-sm text-ink-muted">{t("notesEmpty")}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {deal.notes.map((note) => (
            <li key={note.id} className="rounded-sm bg-surface px-3 py-2">
              <p className="text-sm text-ink whitespace-pre-wrap">{note.body}</p>
              <p className="mt-1 text-xs text-ink-muted">
                {note.authorName} · {formatBuyerDateTime(note.createdAt, locale)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <Textarea
        id="crm-note"
        rows={3}
        value={body}
        placeholder={t("notePlaceholder")}
        onChange={(event) => {
          setBody(event.target.value);
        }}
      />
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <Button
        type="button"
        size="sm"
        disabled={!body.trim() || mutation.isPending}
        onClick={() => {
          void onSubmit();
        }}
      >
        {mutation.isPending ? t("saving") : t("addNote")}
      </Button>
    </section>
  );
};
