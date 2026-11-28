import { TaskStatus, type DomainTask } from "../../index";

export function calculateProgress(tasks: readonly Pick<DomainTask, "status">[]): number {
  const eligibleTasks = tasks.filter((task) => task.status !== TaskStatus.Cancelled);
  if (eligibleTasks.length === 0) {
    return 0;
  }
  const completedTasks = eligibleTasks.filter((task) => task.status === TaskStatus.Completed);
  return Math.round((completedTasks.length / eligibleTasks.length) * 100);
}
