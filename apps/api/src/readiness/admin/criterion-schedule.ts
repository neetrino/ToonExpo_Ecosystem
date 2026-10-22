import type { ReadinessTaskPriority } from '@toonexpo/db';

type ScheduleInput = {
  checked?: boolean | undefined;
  dueDate?: string | null | undefined;
  priority?: ReadinessTaskPriority | undefined;
};

type ExistingSchedule = {
  checked: boolean;
  startedAt: Date | null;
  completedAt: Date | null;
};

export type SchedulePatch = {
  data: {
    priority?: ReadinessTaskPriority;
    dueDate?: Date | null;
    startedAt?: Date;
    completedAt?: Date | null;
    statusChangedAt?: Date;
  };
  event: { fromStatus: string | null; toStatus: string; changedAt: Date } | null;
};

const statusOf = (checked: boolean): string => (checked ? 'done' : 'not_started');

const parseDueDate = (value: string): Date => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('Invalid due date');
  }
  return new Date(`${value}T00:00:00.000Z`);
};

/**
 * Deadline and status-history patch for one criterion score save.
 * A history row is written only when the checked state actually changes.
 */
export const buildSchedulePatch = (
  previous: ExistingSchedule | null,
  input: ScheduleInput,
  now: Date,
): SchedulePatch => {
  const data: SchedulePatch['data'] = {};
  if (input.priority !== undefined) {
    data.priority = input.priority;
  }
  if (input.dueDate !== undefined) {
    data.dueDate = input.dueDate === null ? null : parseDueDate(input.dueDate);
  }
  if (input.checked === undefined) {
    return { data, event: null };
  }

  const wasChecked = previous?.checked ?? false;
  if (previous && input.checked === wasChecked) {
    return { data, event: null };
  }

  data.statusChangedAt = now;
  if (input.checked) {
    data.completedAt = previous?.completedAt ?? now;
    if (!previous?.startedAt) {
      data.startedAt = now;
    }
  } else {
    data.completedAt = null;
  }

  return {
    data,
    event: {
      fromStatus: previous ? statusOf(wasChecked) : null,
      toStatus: statusOf(input.checked),
      changedAt: now,
    },
  };
};
