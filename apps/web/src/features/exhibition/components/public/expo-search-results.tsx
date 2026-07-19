"use client";

import type { BoothSearchResult, PublicBoothDetail } from "@toonexpo/contracts";
import { useTranslations } from "next-intl";

import { Card } from "@/shared/ui/card";
import { cn } from "@/shared/ui/cn";

type ExpoSearchResultsProps = {
  results: BoothSearchResult[];
  highlightedBoothId: string | null;
  onSelect: (boothId: string) => void;
};

/**
 * Debounced search result cards for the expo map.
 */
export const ExpoSearchResults = ({
  results,
  highlightedBoothId,
  onSelect,
}: ExpoSearchResultsProps) => {
  const t = useTranslations("Expo.search");

  if (results.length === 0) {
    return null;
  }

  return (
    <Card className="max-h-48 overflow-y-auto p-0">
      <ul className="flex flex-col divide-y divide-border">
        {results.map((result) => (
          <li key={result.boothId}>
            <button
              type="button"
              className={cn(
                "flex w-full flex-col gap-0.5 px-4 py-3 text-left text-sm hover:bg-surface",
                highlightedBoothId === result.boothId && "bg-surface",
              )}
              onClick={() => onSelect(result.boothId)}
            >
              <span className="font-medium text-ink">{result.name}</span>
              <span className="text-xs text-ink-secondary">
                {t("meta", {
                  code: result.boothCode,
                  type: t(`types.${result.type}`),
                })}
              </span>
              {result.locationText ? (
                <span className="text-xs text-ink-muted">{result.locationText}</span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
};

type ExpoBoothListProps = {
  booths: PublicBoothDetail[];
  highlightedBoothId: string | null;
  onSelect: (boothId: string) => void;
};

/**
 * List fallback for booths when the map is hard to read on mobile.
 */
export const ExpoBoothList = ({
  booths,
  highlightedBoothId,
  onSelect,
}: ExpoBoothListProps) => {
  const t = useTranslations("Expo.list");

  return (
    <Card className="p-0">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">{t("title")}</h2>
      </div>
      <ul className="flex max-h-64 flex-col divide-y divide-border overflow-y-auto">
        {booths.map((booth) => (
          <li key={booth.id}>
            <button
              type="button"
              className={cn(
                "flex w-full flex-col gap-0.5 px-4 py-3 text-left text-sm hover:bg-surface",
                highlightedBoothId === booth.id && "bg-surface",
              )}
              onClick={() => onSelect(booth.id)}
            >
              <span className="font-medium text-ink">
                {booth.name ?? booth.assignments[0]?.displayName ?? booth.code}
              </span>
              <span className="text-xs text-ink-secondary">{booth.code}</span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
};
