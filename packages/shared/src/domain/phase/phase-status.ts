import { PhaseStatus, TaskStatus, type DomainPhase, type DomainTask } from "../../index";

export function calculatePhaseStatus(
  phase: Pick<DomainPhase, "id" | "isOnHold">,
  tasks: readonly Pick<DomainTask, "phaseId" | "status">[],
): PhaseStatus {
  if (phase.isOnHold) {
    return PhaseStatus.OnHold;
  }
  const eligibleTasks = tasks.filter(
    (task) => task.phaseId === phase.id && task.status !== TaskStatus.Cancelled,
  );
  if (eligibleTasks.length === 0) {
    return PhaseStatus.NotStarted;
  }
  const completedCount = eligibleTasks.filter(
    (task) => task.status === TaskStatus.Completed,
  ).length;
  if (completedCount === eligibleTasks.length) {
    return PhaseStatus.Completed;
  }
  const hasStarted = eligibleTasks.some(
    (task) =>
      task.status === TaskStatus.InProgress ||
      task.status === TaskStatus.InReview ||
      task.status === TaskStatus.Completed,
  );
  return hasStarted ? PhaseStatus.InProgress : PhaseStatus.NotStarted;
}
