import { TaskStatus, type DomainTask, type TaskDependency } from "../../index";

export type DependencyValidationErrorCode =
  | "SELF_DEPENDENCY"
  | "TASK_NOT_FOUND"
  | "CROSS_PROJECT_DEPENDENCY"
  | "DUPLICATE_DEPENDENCY"
  | "CIRCULAR_DEPENDENCY";

export type DependencyValidationResult = {
  valid: boolean;
  code?: DependencyValidationErrorCode;
  message?: string;
};

type DependencyEdge = Pick<TaskDependency, "taskId" | "dependsOnTaskId">;
type TaskRef = Pick<DomainTask, "id" | "projectId">;

export function hasCircularDependency(
  taskId: string,
  dependsOnTaskId: string,
  existingDependencies: readonly DependencyEdge[],
): boolean {
  if (taskId === dependsOnTaskId) {
    return true;
  }
  const graph = new Map<string, string[]>();
  for (const edge of existingDependencies) {
    const targets = graph.get(edge.taskId) ?? [];
    targets.push(edge.dependsOnTaskId);
    graph.set(edge.taskId, targets);
  }
  return canReach(graph, dependsOnTaskId, taskId);
}

function canReach(graph: Map<string, string[]>, start: string, target: string): boolean {
  const visited = new Set<string>();
  const stack = [start];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || visited.has(current)) {
      continue;
    }
    if (current === target) {
      return true;
    }
    visited.add(current);
    for (const next of graph.get(current) ?? []) {
      if (!visited.has(next)) {
        stack.push(next);
      }
    }
  }
  return false;
}

export function validateTaskDependency({
  taskId,
  dependsOnTaskId,
  tasks,
  existingDependencies,
}: {
  taskId: string;
  dependsOnTaskId: string;
  tasks: readonly TaskRef[];
  existingDependencies: readonly DependencyEdge[];
}): DependencyValidationResult {
  if (taskId === dependsOnTaskId) {
    return {
      valid: false,
      code: "SELF_DEPENDENCY",
      message: "A task cannot depend on itself",
    };
  }
  const task = tasks.find((item) => item.id === taskId);
  const prerequisite = tasks.find((item) => item.id === dependsOnTaskId);
  if (!task || !prerequisite) {
    return {
      valid: false,
      code: "TASK_NOT_FOUND",
      message: "Both tasks must exist",
    };
  }
  if (task.projectId !== prerequisite.projectId) {
    return {
      valid: false,
      code: "CROSS_PROJECT_DEPENDENCY",
      message: "Dependencies must belong to the same project",
    };
  }
  const isDuplicate = existingDependencies.some(
    (edge) => edge.taskId === taskId && edge.dependsOnTaskId === dependsOnTaskId,
  );
  if (isDuplicate) {
    return {
      valid: false,
      code: "DUPLICATE_DEPENDENCY",
      message: "Dependency already exists",
    };
  }
  if (hasCircularDependency(taskId, dependsOnTaskId, existingDependencies)) {
    return {
      valid: false,
      code: "CIRCULAR_DEPENDENCY",
      message: "Dependency would create a cycle",
    };
  }
  return { valid: true };
}

export function validateProjectReassignmentDependencies(
  taskId: string,
  targetProjectId: string,
  tasks: readonly TaskRef[],
  dependencies: readonly DependencyEdge[],
): { valid: boolean; conflictingTaskIds: string[] } {
  const taskById = new Map(tasks.map((item) => [item.id, item]));
  const conflictingTaskIds: string[] = [];
  for (const edge of dependencies) {
    if (edge.taskId === taskId) {
      const prereq = taskById.get(edge.dependsOnTaskId);
      if (prereq && prereq.projectId !== targetProjectId) {
        conflictingTaskIds.push(prereq.id);
      }
    } else if (edge.dependsOnTaskId === taskId) {
      const dependent = taskById.get(edge.taskId);
      if (dependent && dependent.projectId !== targetProjectId) {
        conflictingTaskIds.push(dependent.id);
      }
    }
  }
  return {
    valid: conflictingTaskIds.length === 0,
    conflictingTaskIds,
  };
}

export function getBlockingTaskIds(
  taskId: string,
  dependencies: readonly DependencyEdge[],
  tasks: readonly Pick<DomainTask, "id" | "status">[],
): string[] {
  const taskById = new Map(tasks.map((item) => [item.id, item]));
  const blocking: string[] = [];
  for (const edge of dependencies) {
    if (edge.taskId !== taskId) {
      continue;
    }
    const prereq = taskById.get(edge.dependsOnTaskId);
    if (prereq && prereq.status !== TaskStatus.Completed) {
      blocking.push(prereq.id);
    }
  }
  return blocking;
}

export function isTaskBlocked(
  task: Pick<DomainTask, "id">,
  dependencies: readonly DependencyEdge[],
  tasks: readonly Pick<DomainTask, "id" | "status">[],
): boolean {
  return getBlockingTaskIds(task.id, dependencies, tasks).length > 0;
}
