import type {
  PortalReadinessAssessmentItem,
  PortalReadinessCriterionItem,
  PortalReadinessRequiredActionItem,
  PortalReadinessScoreItem,
  ReadinessScoreStatus,
} from '@toonexpo/contracts';

import { type DeadlineOutcome } from '@/features/builder/readiness-report/deadline';
import {
  actionStatus,
  actionTask,
  criterionTasks,
  withSequence,
} from '@/features/builder/readiness-report/report-tasks';

export type ReportTaskStatus = 'not_started' | 'in_progress' | 'done' | 'attention';

export type ReportTask = {
  id: string;
  title: string;
  status: ReportTaskStatus;
  epicTitle: string | null;
  sortOrder: number;
  criterion: PortalReadinessCriterionItem | null;
  sequence: number | null;
  priority: string;
  dueDate: string | null;
  createdAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  statusChangedAt: string | null;
  history: { at: string; fromStatus: string | null; toStatus: string }[];
  outcome: DeadlineOutcome;
  lateDays: number | null;
  dueSoon: boolean;
};

export type ReportEpic = {
  id: string;
  title: string;
  status: ReadinessScoreStatus;
  recommendation: string | null;
  helpAvailable: boolean;
  serviceProviderCategoryId: string | null;
  done: number;
  total: number;
  percent: number;
  tasks: ReportTask[];
};

export type ReadinessReport = {
  title: string;
  percent: number;
  done: number;
  total: number;
  open: number;
  attention: number;
  overdue: number;
  upcoming: number;
  inReview: number;
  counts: Record<ReportTaskStatus, number>;
  epics: ReportEpic[];
  unassigned: ReportTask[];
  completionOrder: ReportTask[];
  doneWithoutDeadline: number;
  openWithoutDeadline: number;
  onTime: number;
  late: number;
  pending: number;
  completionDateUnknown: number;
};

const emptyCounts = (): Record<ReportTaskStatus, number> => ({
  not_started: 0,
  in_progress: 0,
  done: 0,
  attention: 0,
});

const completionPercent = (done: number, total: number, fallback: number | null): number => {
  if (total > 0) {
    return Math.round((done / total) * 100);
  }
  return fallback ?? 0;
};

const attachActions = (
  epics: ReportEpic[],
  actions: readonly PortalReadinessRequiredActionItem[],
): ReportTask[] => {
  const unassigned: ReportTask[] = [];

  for (const action of actions) {
    const status = actionStatus(action.status);
    if (status === null) {
      continue;
    }
    const epic = epics.find((item) => item.id === action.scoreId);
    const task = actionTask(action, epic?.title ?? null, status);
    if (!epic) {
      unassigned.push(task);
      continue;
    }
    epic.tasks.push(task);
    epic.total += 1;
    if (status === 'done') {
      epic.done += 1;
    }
    epic.percent = completionPercent(epic.done, epic.total, null);
  }

  return unassigned;
};

const countTasks = (tasks: readonly ReportTask[]): Record<ReportTaskStatus, number> => {
  const counts = emptyCounts();
  for (const task of tasks) {
    counts[task.status] += 1;
  }
  return counts;
};

const applySequence = (epics: ReportEpic[], unassigned: ReportTask[]): ReportTask[] => {
  const sequenced = withSequence([...epics.flatMap((epic) => epic.tasks), ...unassigned]);
  const byId = new Map(sequenced.map((task) => [task.id, task]));

  for (const epic of epics) {
    epic.tasks = epic.tasks.map((task) => byId.get(task.id) ?? task);
  }
  for (let index = 0; index < unassigned.length; index += 1) {
    const current = unassigned[index];
    if (current) {
      unassigned[index] = byId.get(current.id) ?? current;
    }
  }

  return sequenced;
};

type ReportLabels = {
  title: string;
  categoryLabel: (code: string, fallback: string) => string;
  criterionLabel: (code: string) => string;
};

const toEpic = (score: PortalReadinessScoreItem, labels: ReportLabels): ReportEpic => {
  const title = labels.categoryLabel(score.categoryCode, score.categoryName);
  const tasks = criterionTasks(score, title, labels.criterionLabel);
  const done = tasks.filter((task) => task.status === 'done').length;

  return {
    id: score.id,
    title,
    status: score.status,
    recommendation: score.recommendationSummary,
    helpAvailable: score.helpAvailable,
    serviceProviderCategoryId: score.serviceProviderCategoryId,
    done,
    total: tasks.length,
    percent: completionPercent(done, tasks.length, score.score),
    tasks,
  };
};

/**
 * Builder report view-model. Deadlines are not stored, so deadline buckets stay at zero
 * and finished work is counted as completed without a deadline.
 */
export const buildReadinessReport = (
  assessment: PortalReadinessAssessmentItem,
  labels: ReportLabels,
): ReadinessReport => {
  const epics = assessment.scores.map((score) => toEpic(score, labels));
  const unassigned = attachActions(epics, assessment.requiredActions);
  const tasks = applySequence(epics, unassigned);
  const counts = countTasks(tasks);
  const done = counts.done;
  const total = tasks.length;
  const outcomes = tasks.map((task) => task.outcome);
  const outcomeCount = (outcome: DeadlineOutcome): number =>
    outcomes.filter((value) => value === outcome).length;
  const inReview = epics
    .filter((epic) => epic.status === 'needs_improvement')
    .reduce((sum, epic) => sum + epic.tasks.filter((task) => task.status !== 'done').length, 0);

  return {
    title: labels.title,
    percent: completionPercent(done, total, assessment.overallScore),
    done,
    total,
    open: total - done,
    attention: counts.attention,
    overdue: outcomeCount('OVERDUE'),
    upcoming: tasks.filter((task) => task.dueSoon).length,
    inReview,
    counts,
    epics,
    unassigned,
    completionOrder: tasks.filter((task) => task.sequence !== null),
    doneWithoutDeadline: outcomeCount('COMPLETED_NO_DEADLINE'),
    openWithoutDeadline: outcomeCount('NO_DEADLINE'),
    onTime: outcomeCount('COMPLETED_ON_TIME'),
    late: outcomeCount('COMPLETED_LATE'),
    pending: outcomeCount('PENDING'),
    completionDateUnknown: outcomeCount('COMPLETION_DATE_UNKNOWN'),
  };
};
