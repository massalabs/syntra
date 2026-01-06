import { Schedule } from '@/serializable/Schedule';

export type HistoryItem = {
  period?: bigint;
  thread?: number;
  index: number;
  processed: boolean;
  isReady: boolean;
};

/**
 * Compute history items for a schedule, determining which tasks are processed
 * and which are ready to be manually triggered.
 */
export function computeHistoryItems(
  schedule: Schedule,
  currentPeriod: bigint,
): HistoryItem[] {
  const startPeriod = schedule.history[0]?.period;
  if (!startPeriod) return [];

  return Array.from({ length: Number(schedule.occurrences) }, (_, taskIndex) => {
    const task = schedule.history.find((h) => h.taskIndex === BigInt(taskIndex));
    const expectedPeriod =
      startPeriod + BigInt(taskIndex) * schedule.interval + schedule.tolerance;
    const isReady = currentPeriod > expectedPeriod;

    return {
      period: task?.period,
      thread: task?.thread,
      index: taskIndex,
      processed: !!task,
      isReady,
    };
  });
}

/**
 * Count the number of tasks that are ready but not processed (failed/missed).
 */
export function countPendingTasks(items: HistoryItem[]): number {
  return items.filter((i) => !i.processed && i.isReady).length;
}

/**
 * Count the number of processed tasks.
 */
export function countProcessedTasks(items: HistoryItem[]): number {
  return items.filter((i) => i.processed).length;
}

/**
 * Filter items to only include those that are processed or ready.
 */
export function filterVisibleItems(items: HistoryItem[]): HistoryItem[] {
  return items.filter((item) => item.processed || item.isReady);
}

