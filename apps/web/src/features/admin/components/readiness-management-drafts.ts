import type { ReadinessAssessmentDetail, ReadinessCriterionScoreItem } from '@toonexpo/contracts';

import type { CriterionDraftMap } from '@/features/admin/components/readiness-criterion-row';

export const flattenReadinessCriteria = (
  items: readonly ReadinessCriterionScoreItem[],
): ReadinessCriterionScoreItem[] => {
  const result: ReadinessCriterionScoreItem[] = [];
  const walk = (nodes: readonly ReadinessCriterionScoreItem[]) => {
    for (const node of nodes) {
      result.push(node);
      walk(node.children);
    }
  };
  walk(items);
  return result;
};

export const buildReadinessDraftMap = (
  assessment: ReadinessAssessmentDetail,
): CriterionDraftMap => {
  const drafts: CriterionDraftMap = {};
  for (const score of assessment.scores) {
    for (const criterion of flattenReadinessCriteria(score.criteria)) {
      drafts[criterion.criterionId] = {
        value: criterion.value,
        checked: criterion.checked,
      };
    }
  }
  return drafts;
};

export const categoryPercentFromDrafts = (
  roots: readonly ReadinessCriterionScoreItem[],
  drafts: CriterionDraftMap,
): number | null => {
  let earned = 0;
  let max = 0;
  for (const criterion of flattenReadinessCriteria(roots)) {
    if (criterion.children.length > 0) {
      continue;
    }
    if (criterion.maxPoints === null || criterion.maxPoints <= 0) {
      continue;
    }
    const draft = drafts[criterion.criterionId];
    const value = draft ? draft.value : criterion.value;
    if (value === null) {
      continue;
    }
    earned += Math.min(criterion.maxPoints, Math.max(0, value));
    max += criterion.maxPoints;
  }
  if (max === 0) {
    return null;
  }
  return Math.round((earned / max) * 100);
};

export const weightedOverallFromPercents = (
  entries: readonly { percent: number | null; weight: number | null }[],
): number => {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const entry of entries) {
    if (entry.percent === null) {
      continue;
    }
    const weight = entry.weight ?? 1;
    weightedSum += entry.percent * weight;
    totalWeight += weight;
  }
  if (totalWeight === 0) {
    return 0;
  }
  return Math.round(weightedSum / totalWeight);
};

export const isReadinessDraftDirty = (
  baseline: CriterionDraftMap,
  drafts: CriterionDraftMap,
): boolean => {
  const ids = new Set([...Object.keys(baseline), ...Object.keys(drafts)]);
  for (const id of ids) {
    const left = baseline[id];
    const right = drafts[id];
    if (!left || !right) {
      return true;
    }
    if (left.value !== right.value || left.checked !== right.checked) {
      return true;
    }
  }
  return false;
};
