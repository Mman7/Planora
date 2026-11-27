import type { Database } from "@repo/database";
import { ConflictError, NotFoundError } from "../../lib/errors";
import { createPlanningRepository } from "./planning.repository";
import type {
  CreatePhaseInput,
  CreateTaskInput,
  UpdatePhaseInput,
  UpdateTaskInput,
} from "./planning.validation";

const PROJECT_NOT_FOUND = "Project not found";
const RESOURCE_NOT_FOUND = "Planning item not found";

type PlanningRepository = ReturnType<typeof createPlanningRepository>;

export function createPlanningService(database: Database) {
  const repository = createPlanningRepository(database);
  return {
    listPhases: (ownerId: string, projectId: string) => listPhases(repository, ownerId, projectId),
    createPhase: (ownerId: string, projectId: string, input: CreatePhaseInput) =>
      createPhase(repository, ownerId, projectId, input),
    getPhase: (ownerId: string, projectId: string, phaseId: string) =>
      getPhase(repository, ownerId, projectId, phaseId),
    updatePhase: (ownerId: string, projectId: string, phaseId: string, input: UpdatePhaseInput) =>
      updatePhase(repository, { ownerId, projectId, phaseId, input }),
    deletePhase: (ownerId: string, projectId: string, phaseId: string) =>
      deletePhase(repository, ownerId, projectId, phaseId),
    listTasks: (ownerId: string, projectId: string) => listTasks(repository, ownerId, projectId),
    createTask: (ownerId: string, projectId: string, input: CreateTaskInput) =>
      createTask(repository, ownerId, projectId, input),
    getTask: (ownerId: string, projectId: string, taskId: string) =>
      getTask(repository, ownerId, projectId, taskId),
    updateTask: (ownerId: string, projectId: string, taskId: string, input: UpdateTaskInput) =>
      updateTask(repository, { ownerId, projectId, taskId, input }),
    deleteTask: (ownerId: string, projectId: string, taskId: string) =>
      deleteTask(repository, ownerId, projectId, taskId),
    addDependency: (ownerId: string, projectId: string, taskId: string, dependsOnTaskId: string) =>
      addDependency(repository, { ownerId, projectId, taskId, dependsOnTaskId }),
    removeDependency: (
      ownerId: string,
      projectId: string,
      taskId: string,
      dependsOnTaskId: string,
    ) => removeDependency(repository, { ownerId, projectId, taskId, dependsOnTaskId }),
  };
}

async function ensureProject(repository: PlanningRepository, ownerId: string, projectId: string) {
  if (!(await repository.ownsProject(ownerId, projectId)))
    throw new NotFoundError("PROJECT_NOT_FOUND", PROJECT_NOT_FOUND);
}

function missingPlanningItem(): never {
  throw new NotFoundError("PLANNING_ITEM_NOT_FOUND", RESOURCE_NOT_FOUND);
}

async function listPhases(repository: PlanningRepository, ownerId: string, projectId: string) {
  await ensureProject(repository, ownerId, projectId);
  return repository.listPhases(projectId);
}

async function createPhase(
  repository: PlanningRepository,
  ownerId: string,
  projectId: string,
  input: CreatePhaseInput,
) {
  await ensureProject(repository, ownerId, projectId);
  return repository.createPhase(projectId, input);
}

async function getPhase(
  repository: PlanningRepository,
  ownerId: string,
  projectId: string,
  phaseId: string,
) {
  await ensureProject(repository, ownerId, projectId);
  return (await repository.getPhase(projectId, phaseId)) ?? missingPlanningItem();
}

async function updatePhase(
  repository: PlanningRepository,
  {
    ownerId,
    projectId,
    phaseId,
    input,
  }: {
    ownerId: string;
    projectId: string;
    phaseId: string;
    input: UpdatePhaseInput;
  },
) {
  await ensureProject(repository, ownerId, projectId);
  return (await repository.updatePhase(projectId, phaseId, input)) ?? missingPlanningItem();
}

async function deletePhase(
  repository: PlanningRepository,
  ownerId: string,
  projectId: string,
  phaseId: string,
) {
  await ensureProject(repository, ownerId, projectId);
  return (await repository.deletePhase(projectId, phaseId)) ?? missingPlanningItem();
}

async function listTasks(repository: PlanningRepository, ownerId: string, projectId: string) {
  await ensureProject(repository, ownerId, projectId);
  return repository.listTasks(projectId);
}

async function createTask(
  repository: PlanningRepository,
  ownerId: string,
  projectId: string,
  input: CreateTaskInput,
) {
  await ensureProject(repository, ownerId, projectId);
  return repository.createTask(projectId, input);
}

async function getTask(
  repository: PlanningRepository,
  ownerId: string,
  projectId: string,
  taskId: string,
) {
  await ensureProject(repository, ownerId, projectId);
  return (await repository.getTask(projectId, taskId)) ?? missingPlanningItem();
}

async function updateTask(
  repository: PlanningRepository,
  {
    ownerId,
    projectId,
    taskId,
    input,
  }: {
    ownerId: string;
    projectId: string;
    taskId: string;
    input: UpdateTaskInput;
  },
) {
  await ensureProject(repository, ownerId, projectId);
  return (await repository.updateTask(projectId, taskId, input)) ?? missingPlanningItem();
}

async function deleteTask(
  repository: PlanningRepository,
  ownerId: string,
  projectId: string,
  taskId: string,
) {
  await ensureProject(repository, ownerId, projectId);
  return (await repository.deleteTask(projectId, taskId)) ?? missingPlanningItem();
}

async function addDependency(
  repository: PlanningRepository,
  {
    ownerId,
    projectId,
    taskId,
    dependsOnTaskId,
  }: {
    ownerId: string;
    projectId: string;
    taskId: string;
    dependsOnTaskId: string;
  },
) {
  await ensureProject(repository, ownerId, projectId);
  await validateDependency(repository, projectId, taskId, dependsOnTaskId);
  return repository.addDependency(taskId, dependsOnTaskId);
}

async function removeDependency(
  repository: PlanningRepository,
  {
    ownerId,
    projectId,
    taskId,
    dependsOnTaskId,
  }: {
    ownerId: string;
    projectId: string;
    taskId: string;
    dependsOnTaskId: string;
  },
) {
  await ensureProject(repository, ownerId, projectId);
  if (
    !(await repository.taskInProject(projectId, taskId)) ||
    !(await repository.taskInProject(projectId, dependsOnTaskId))
  )
    throw new NotFoundError("TASK_NOT_FOUND", "Task not found");
  return (await repository.removeDependency(taskId, dependsOnTaskId)) ?? missingPlanningItem();
}

async function validateDependency(
  repository: PlanningRepository,
  projectId: string,
  taskId: string,
  dependsOnTaskId: string,
) {
  if (
    taskId === dependsOnTaskId ||
    !(await repository.taskInProject(projectId, taskId)) ||
    !(await repository.taskInProject(projectId, dependsOnTaskId))
  )
    throw new ConflictError(
      "INVALID_DEPENDENCY",
      "Both tasks must belong to the project and cannot be the same task",
    );
  if (await repository.dependencyExists(taskId, dependsOnTaskId))
    throw new ConflictError("DUPLICATE_DEPENDENCY", "Dependency already exists");
  const graph = createDependencyGraph(await repository.dependencies(projectId));
  graph.set(taskId, [...(graph.get(taskId) ?? []), dependsOnTaskId]);
  if (hasDependencyPath(graph, dependsOnTaskId, taskId))
    throw new ConflictError("DEPENDENCY_CYCLE", "Dependency would create a cycle");
}

function createDependencyGraph(edges: { taskId: string; dependsOnTaskId: string }[]) {
  const graph = new Map<string, string[]>();
  for (const edge of edges)
    graph.set(edge.taskId, [...(graph.get(edge.taskId) ?? []), edge.dependsOnTaskId]);
  return graph;
}

function hasDependencyPath(graph: Map<string, string[]>, start: string, target: string) {
  const visited = new Set<string>();
  const visit = (current: string): boolean => {
    if (current === target) return true;
    if (visited.has(current)) return false;
    visited.add(current);
    return (graph.get(current) ?? []).some(visit);
  };
  return visit(start);
}
