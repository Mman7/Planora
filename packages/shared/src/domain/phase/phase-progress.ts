import type { DomainTask } from "../../index";
import { calculateProgress } from "../task/task-progress";

export function calculatePhaseProgress(
  phaseId: string,
  tasks: readonly Pick<DomainTask, "phaseId" | "status">[],
): number {
  const phaseTasks = tasks.filter((task) => task.phaseId === phaseId);
  return calculateProgress(phaseTasks);
}
