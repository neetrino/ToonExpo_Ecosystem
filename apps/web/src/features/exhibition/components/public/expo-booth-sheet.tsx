"use client";

import type { PublicBoothDetail } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

type ExpoBoothSheetProps = {
  booth: PublicBoothDetail;
  routeAvailable: boolean;
  onRoute: () => void;
  onClose: () => void;
};

/**
 * Bottom sheet for a selected booth on the public expo map.
 */
export const ExpoBoothSheet = ({
  booth,
  routeAvailable,
  onRoute,
  onClose,
}: ExpoBoothSheetProps) => {
  const t = useTranslations("Expo.booth");
  const primaryAssignment = booth.assignments[0] ?? null;

  return (
    <Card className="flex flex-col gap-3 border-t-4 border-brand px-4 py-4 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            {t(`types.${booth.type}`)}
          </p>
          <h2 className="text-lg font-semibold text-ink">
            {booth.name ?? primaryAssignment?.displayName ?? booth.code}
          </h2>
          <p className="text-sm text-ink-secondary">
            {t("code", { code: booth.code })}
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {t("close")}
        </Button>
      </div>
      {booth.locationText ? (
        <p className="text-sm text-ink-secondary">{booth.locationText}</p>
      ) : null}
      {booth.assignments.length > 0 ? (
        <ul className="flex flex-col gap-1 text-sm">
          {booth.assignments.map((assignment) => (
            <li key={assignment.id}>
              {assignment.displayName}
              {assignment.assignmentLabel ? ` · ${assignment.assignmentLabel}` : ""}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {primaryAssignment?.projectId ? (
          <Link href={`/projects/${primaryAssignment.projectId}`}>
            <Button type="button" size="sm" variant="secondary">
              {t("openProject")}
            </Button>
          </Link>
        ) : null}
        <Button type="button" size="sm" variant="ghost" onClick={onRoute}>
          {routeAvailable ? t("route") : t("routeUnavailable")}
        </Button>
      </div>
    </Card>
  );
};
