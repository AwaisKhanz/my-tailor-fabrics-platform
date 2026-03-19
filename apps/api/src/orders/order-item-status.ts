import { TaskStatus as PrismaTaskStatus } from '@prisma/client';
import { ItemStatus, TaskStatus } from '@tbms/shared-types';

type TaskStatusLike = TaskStatus | PrismaTaskStatus;

export function deriveOrderItemStatusFromTaskStatuses(
  taskStatuses: readonly TaskStatusLike[],
): ItemStatus | null {
  if (taskStatuses.length === 0) {
    return null;
  }

  const hasNonCancelledTask = taskStatuses.some(
    (status) => status !== PrismaTaskStatus.CANCELLED,
  );

  if (!hasNonCancelledTask) {
    return ItemStatus.CANCELLED;
  }

  const allWorkFinished = taskStatuses.every(
    (status) =>
      status === PrismaTaskStatus.DONE ||
      status === PrismaTaskStatus.CANCELLED,
  );

  if (allWorkFinished) {
    return ItemStatus.COMPLETED;
  }

  const workHasStarted = taskStatuses.some(
    (status) =>
      status === PrismaTaskStatus.IN_PROGRESS ||
      status === PrismaTaskStatus.DONE,
  );

  if (workHasStarted) {
    return ItemStatus.IN_PROGRESS;
  }

  return ItemStatus.PENDING;
}
