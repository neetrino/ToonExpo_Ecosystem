'use client';

import type { ReadinessCriterionScoreItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { ReadinessCriterionProviderSelect } from '@/features/admin/components/readiness-criterion-provider-select';
import { cn } from '@/shared/ui/cn';

export type CriterionDraft = {
  value: number | null;
  checked: boolean;
};

export type CriterionDraftMap = Record<string, CriterionDraft>;

const groupEarnedPercent = (
  item: ReadinessCriterionScoreItem,
  drafts: CriterionDraftMap,
): number | null => {
  let earned = 0;
  let max = 0;
  for (const child of item.children) {
    const draft = drafts[child.criterionId];
    const value = draft ? draft.value : child.value;
    if (child.maxPoints === null || child.maxPoints <= 0 || value === null) {
      continue;
    }
    earned += Math.min(child.maxPoints, Math.max(0, value));
    max += child.maxPoints;
  }
  if (max === 0) {
    return null;
  }
  return Math.round((earned / max) * 100);
};

type ReadinessCriterionRowProps = {
  item: ReadinessCriterionScoreItem;
  drafts: CriterionDraftMap;
  disabled?: boolean | undefined;
  depth?: number | undefined;
  onChange: (criterionId: string, next: CriterionDraft) => void;
};

/**
 * Draft-only KPI criterion row — persists when the modal Save runs.
 */
export const ReadinessCriterionRow = ({
  item,
  drafts,
  disabled = false,
  depth = 0,
  onChange,
}: ReadinessCriterionRowProps) => {
  const t = useTranslations('ReadinessKpi');
  const draft = drafts[item.criterionId] ?? {
    value: item.value,
    checked: item.checked,
  };
  const [text, setText] = useState(draft.value === null ? '' : String(draft.value));
  const isGroup = item.children.length > 0;
  const groupPercent = isGroup ? groupEarnedPercent(item, drafts) : null;
  const label = t(`criteria.${item.code}`);
  const canScore = item.maxPoints !== null && item.maxPoints > 0;

  useEffect(() => {
    setText(draft.value === null ? '' : String(draft.value));
  }, [draft.value]);

  const commitText = (raw: string) => {
    if (!canScore) {
      return;
    }
    const trimmed = raw.trim();
    if (trimmed === '') {
      onChange(item.criterionId, { value: null, checked: false });
      return;
    }
    const parsed = Number.parseInt(trimmed, 10);
    if (Number.isNaN(parsed)) {
      setText(draft.value === null ? '' : String(draft.value));
      return;
    }
    const clamped = Math.max(0, Math.min(item.maxPoints ?? parsed, parsed));
    setText(String(clamped));
    onChange(item.criterionId, { value: clamped, checked: true });
  };

  const toggleChecked = () => {
    if (isGroup) {
      return;
    }
    if (draft.checked) {
      onChange(item.criterionId, { checked: false, value: null });
      return;
    }
    if (canScore) {
      onChange(item.criterionId, {
        checked: true,
        value: draft.value ?? item.maxPoints,
      });
      return;
    }
    onChange(item.criterionId, { checked: true, value: draft.value });
  };

  return (
    <div className={cn(depth > 0 && 'ml-6 border-l border-border/70 pl-3')}>
      <div className="flex flex-wrap items-center gap-3 py-2">
        {!isGroup ? (
          <input
            type="checkbox"
            className="size-4 shrink-0 rounded border-border accent-brand"
            checked={draft.checked}
            disabled={disabled}
            onChange={toggleChecked}
            aria-label={label}
          />
        ) : (
          <span className="size-4 shrink-0" aria-hidden />
        )}

        <p
          className={cn(
            'min-w-0 flex-1 text-sm text-ink',
            isGroup ? 'font-semibold' : 'font-medium',
          )}
        >
          {label}
        </p>

        <ReadinessCriterionProviderSelect
          criterionId={item.criterionId}
          value={item.serviceProviderCategoryId}
          disabled={disabled}
        />

        {isGroup ? (
          <span className="shrink-0 text-sm font-semibold tabular-nums text-ink-secondary">
            {groupPercent === null ? '—' : `${groupPercent}%`}
          </span>
        ) : canScore ? (
          <div className="flex shrink-0 items-center gap-1">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={item.maxPoints ?? undefined}
              className="h-8 w-14 rounded-md border border-border bg-surface-elevated px-2 text-right text-sm tabular-nums text-ink"
              value={text}
              disabled={disabled}
              onChange={(event) => {
                setText(event.target.value);
              }}
              onBlur={() => {
                commitText(text);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.currentTarget.blur();
                }
              }}
              aria-label={`${label} score`}
            />
            <span className="text-sm text-ink-muted">/ {item.maxPoints}%</span>
          </div>
        ) : (
          <span className="shrink-0 text-sm text-ink-muted">—</span>
        )}
      </div>

      {item.children.map((child) => (
        <ReadinessCriterionRow
          key={child.criterionId}
          item={child}
          drafts={drafts}
          disabled={disabled}
          depth={depth + 1}
          onChange={onChange}
        />
      ))}
    </div>
  );
};
