import type { DomainTask } from "../../index";
import { calculateProgress } from "../task/task-progress";

export function calculateProjectProgress(tasks: readonly Pick<DomainTask, "status">[]): number {
  return calculateProgress(tasks);
}
