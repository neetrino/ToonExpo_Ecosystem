import type {
  PortalReadinessCriterionItem,
  PortalReadinessRequiredActionItem,
  PortalReadinessScoreItem,
  ReadinessScoreStatus,
} from '@toonexpo/contracts';

import { deadlineFacts } from '@/features/builder/readiness-report/deadline';
import type {
  ReportTask,
  ReportTaskStatus,
} from '@/features/builder/readiness-report/report-model';

const leaves = (items: readonly PortalReadinessCriterionItem[]): PortalReadinessCriterionItem[] =>
  items.flatMap((item) => (item.children.length > 0 ? leaves(item.children) : [item]));

const criterionStatus = (
  item: PortalReadinessCriterionItem,
  categoryStatus: ReadinessScoreStatus,
): ReportTaskStatus => {
  if (item.checked || item.percent === 100) {
    return 'done';
  }
  if (categoryStatus === 'blocked' || categoryStatus === 'needs_improvement') {
    return 'attention';
  }
  if ((item.value ?? 0) > 0 || categoryStatus === 'in_progress') {
    return 'in_progress';
  }
  return 'not_started';
};

export const actionStatus = (
  status: PortalReadinessRequiredActionItem['status'],
): ReportTaskStatus | null => {
  if (status === 'cancelled') {
    return null;
  }
  if (status === 'done') {
    return 'done';
  }
  if (status === 'blocked') {
    return 'attention';
  }
  if (status === 'in_progress') {
    return 'in_progress';
  }
  return 'not_started';
};

const taskSchedule = (item: PortalReadinessCriterionItem, done: boolean) => {
  const facts = deadlineFacts({
    done,
    dueDate: item.dueDate ?? null,
    completedAt: item.completedAt ?? null,
  });
  return {
    priority: item.priority ?? 'medium',
    dueDate: item.dueDate ?? null,
    createdAt: item.createdAt ?? null,
    startedAt: item.startedAt ?? null,
    completedAt: item.completedAt ?? null,
    statusChangedAt: item.statusChangedAt ?? null,
    history: item.history ?? [],
    outcome: facts.outcome,
    lateDays: facts.lateDays,
    dueSoon: facts.dueSoon,
  };
};

const emptySchedule = () => ({
  priority: 'medium',
  dueDate: null,
  createdAt: null,
  startedAt: null,
  completedAt: null,
  statusChangedAt: null,
  history: [],
  outcome: 'NO_DEADLINE' as const,
  lateDays: null,
  dueSoon: false,
});

/** Finished tasks that share a completion timestamp share one rank. */
export const withSequence = (tasks: readonly ReportTask[]): ReportTask[] => {
  const finished = tasks
    .filter((task) => task.completedAt)
    .sort(
      (left, right) =>
        (left.completedAt ?? '').localeCompare(right.completedAt ?? '') ||
        left.id.localeCompare(right.id),
    );
  const orderByTime = new Map<string, number>();
  let order = 0;
  let previous: string | null = null;
  for (const task of finished) {
    if (task.completedAt !== previous) {
      order += 1;
      previous = task.completedAt;
    }
    orderByTime.set(task.completedAt ?? '', order);
  }
  const byId = new Map(
    finished.map((task) => [task.id, orderByTime.get(task.completedAt ?? '') ?? null]),
  );
  return tasks.map((task) => ({ ...task, sequence: byId.get(task.id) ?? null }));
};

export const criterionTasks = (
  score: PortalReadinessScoreItem,
  epicTitle: string,
  criterionLabel: (code: string) => string,
): ReportTask[] =>
  leaves(score.criteria).map((item, index) => {
    const status = criterionStatus(item, score.status);
    return {
      id: item.criterionId,
      title: criterionLabel(item.code),
      status,
      epicTitle,
      sortOrder: item.sortOrder || index + 1,
      criterion: item,
      sequence: null,
      ...taskSchedule(item, status === 'done'),
    };
  });

export const actionTask = (
  action: PortalReadinessRequiredActionItem,
  epicTitle: string | null,
  status: ReportTaskStatus,
): ReportTask => ({
  id: action.id,
  title: action.title,
  status,
  epicTitle,
  sortOrder: Number.MAX_SAFE_INTEGER,
  criterion: null,
  sequence: null,
  ...emptySchedule(),
  outcome: status === 'done' ? 'COMPLETED_NO_DEADLINE' : 'NO_DEADLINE',
});
