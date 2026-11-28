import type { Database } from "@repo/database";
import { validateDateRange, validatePhaseDateRange, validateTaskDependency } from "@repo/shared";
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
    reorderPhases: (ownerId: string, projectId: string, phaseIds: string[]) =>
      reorderPhases(repository, ownerId, projectId, phaseIds),
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
    listDependencies: (ownerId: string, projectId: string) =>
      listDependencies(repository, ownerId, projectId),
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

function assertValidPhaseDates(startDate?: string | null, dueDate?: string | null) {
  const result = validatePhaseDateRange(startDate, dueDate);
  if (!result.valid) {
    throw new ConflictError("INVALID_DATE_RANGE", result.error ?? "Invalid phase date range");
  }
}

function assertValidTaskDates(startDate?: string | null, dueDate?: string | null) {
  const result = validateDateRange(startDate, dueDate);
  if (!result.valid) {
    throw new ConflictError("INVALID_DATE_RANGE", result.error ?? "Invalid task date range");
  }
}

async function ensurePhaseInProject(
  repository: PlanningRepository,
  projectId: string,
  phaseId: string | null | undefined,
) {
  if (!phaseId) return;
  const phase = await repository.getPhase(projectId, phaseId);
  if (!phase) {
    throw new ConflictError("INVALID_PHASE", "Phase does not belong to this project");
  }
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
  assertValidPhaseDates(input.startDate, input.dueDate ?? input.endDate);
  let position = input.position;
  if (position === undefined) {
    const existing = await repository.listPhases(projectId);
    position = existing.reduce((max, item) => Math.max(max, item.position + 1), 0);
  }
  return repository.createPhase(projectId, { ...input, position });
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
  const current = (await repository.getPhase(projectId, phaseId)) ?? missingPlanningItem();
  const nextStart = input.startDate !== undefined ? input.startDate : current.startDate;
  const requestedEnd = input.dueDate !== undefined ? input.dueDate : input.endDate;
  const nextEnd = requestedEnd !== undefined ? requestedEnd : current.endDate;
  assertValidPhaseDates(nextStart, nextEnd);
  return (await repository.updatePhase(projectId, phaseId, input)) ?? missingPlanningItem();
}

async function reorderPhases(
  repository: PlanningRepository,
  ownerId: string,
  projectId: string,
  phaseIds: string[],
) {
  await ensureProject(repository, ownerId, projectId);
  const existing = await repository.listPhases(projectId);
  const existingIds = new Set(existing.map((phase) => phase.id));
  const uniqueIds = new Set(phaseIds);
  if (uniqueIds.size !== phaseIds.length || phaseIds.some((id) => !existingIds.has(id))) {
    throw new ConflictError("INVALID_PHASE_ORDER", "All phases must belong to this project");
  }
  return repository.reorderPhases(projectId, phaseIds);
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
  assertValidTaskDates(input.startDate, input.dueDate);
  await ensurePhaseInProject(repository, projectId, input.phaseId);
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
  const current = (await repository.getTask(projectId, taskId)) ?? missingPlanningItem();
  const nextStart = input.startDate !== undefined ? input.startDate : current.startDate;
  const nextDue = input.dueDate !== undefined ? input.dueDate : current.dueDate;
  assertValidTaskDates(nextStart, nextDue);
  if (input.phaseId !== undefined) {
    await ensurePhaseInProject(repository, projectId, input.phaseId);
  }
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

async function listDependencies(
  repository: PlanningRepository,
  ownerId: string,
  projectId: string,
) {
  await ensureProject(repository, ownerId, projectId);
  return repository.dependencies(projectId);
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
  const [projectTasks, existingDependencies] = await Promise.all([
    repository.listTasks(projectId),
    repository.dependencies(projectId),
  ]);
  const validation = validateTaskDependency({
    taskId,
    dependsOnTaskId,
    tasks: projectTasks,
    existingDependencies,
  });
  if (!validation.valid) {
    throw new ConflictError(
      validation.code ?? "INVALID_DEPENDENCY",
      validation.message ?? "Invalid dependency",
    );
  }
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
