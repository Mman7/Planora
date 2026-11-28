import { and, asc, eq } from "drizzle-orm";
import { TaskStatus } from "@repo/shared";
import { phases, projects, taskDependencies, tasks, type Database } from "@repo/database";
import type {
  CreatePhaseInput,
  CreateTaskInput,
  UpdatePhaseInput,
  UpdateTaskInput,
} from "./planning.validation";

function mapPhaseRecord<T extends { endDate: string | null }>(phase: T) {
  return {
    ...phase,
    dueDate: phase.endDate,
  };
}

function createPhaseRepository(database: Database) {
  return {
    ownsProject: (ownerId: string, projectId: string) => ownsProject(database, ownerId, projectId),
    listPhases: (projectId: string) => listPhases(database, projectId),
    createPhase: (projectId: string, input: CreatePhaseInput) =>
      createPhase(database, projectId, input),
    getPhase: (projectId: string, phaseId: string) => getPhase(database, projectId, phaseId),
    updatePhase: (projectId: string, phaseId: string, input: UpdatePhaseInput) =>
      updatePhase(database, projectId, phaseId, input),
    reorderPhases: (projectId: string, phaseIds: string[]) =>
      reorderPhases(database, projectId, phaseIds),
    deletePhase: (projectId: string, phaseId: string) => deletePhase(database, projectId, phaseId),
  };
}

function createTaskRepository(database: Database) {
  return {
    listTasks: (projectId: string) => listTasks(database, projectId),
    createTask: (projectId: string, input: CreateTaskInput) =>
      createTask(database, projectId, input),
    getTask: (projectId: string, taskId: string) => getTask(database, projectId, taskId),
    updateTask: (projectId: string, taskId: string, input: UpdateTaskInput) =>
      updateTask(database, projectId, taskId, input),
    deleteTask: (projectId: string, taskId: string) => deleteTask(database, projectId, taskId),
  };
}

function createDependencyRepository(database: Database) {
  return {
    taskInProject: (projectId: string, taskId: string) =>
      taskInProject(database, projectId, taskId),
    dependencies: (projectId: string) => dependencies(database, projectId),
    dependencyExists: (taskId: string, dependsOnTaskId: string) =>
      dependencyExists(database, taskId, dependsOnTaskId),
    addDependency: (taskId: string, dependsOnTaskId: string) =>
      addDependency(database, taskId, dependsOnTaskId),
    removeDependency: (taskId: string, dependsOnTaskId: string) =>
      removeDependency(database, taskId, dependsOnTaskId),
  };
}

// Planning repository that combines phase, task, and dependency repositories
export function createPlanningRepository(database: Database) {
  return {
    ...createPhaseRepository(database),
    ...createTaskRepository(database),
    ...createDependencyRepository(database),
  };
}

async function ownsProject(database: Database, ownerId: string, projectId: string) {
  const [project] = await database
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.ownerId, ownerId)))
    .limit(1);
  return Boolean(project);
}

async function listPhases(database: Database, projectId: string) {
  const rows = await database
    .select()
    .from(phases)
    .where(eq(phases.projectId, projectId))
    .orderBy(asc(phases.position), asc(phases.createdAt));
  return rows.map(mapPhaseRecord);
}

async function createPhase(database: Database, projectId: string, input: CreatePhaseInput) {
  const { dueDate, endDate, ...rest } = input;
  const resolvedEndDate = dueDate !== undefined ? dueDate : endDate;
  const [phase] = await database
    .insert(phases)
    .values({
      id: crypto.randomUUID(),
      projectId,
      ...rest,
      ...(resolvedEndDate !== undefined ? { endDate: resolvedEndDate } : {}),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  return phase ? mapPhaseRecord(phase) : undefined;
}

async function getPhase(database: Database, projectId: string, phaseId: string) {
  const [phase] = await database
    .select()
    .from(phases)
    .where(and(eq(phases.id, phaseId), eq(phases.projectId, projectId)))
    .limit(1);
  return phase ? mapPhaseRecord(phase) : undefined;
}

async function updatePhase(
  database: Database,
  projectId: string,
  phaseId: string,
  input: UpdatePhaseInput,
) {
  const { dueDate, endDate, ...rest } = input;
  const resolvedEndDate = dueDate !== undefined ? dueDate : endDate;
  const [phase] = await database
    .update(phases)
    .set({
      ...rest,
      ...(resolvedEndDate !== undefined ? { endDate: resolvedEndDate } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(phases.id, phaseId), eq(phases.projectId, projectId)))
    .returning();
  return phase ? mapPhaseRecord(phase) : undefined;
}

async function reorderPhases(database: Database, projectId: string, phaseIds: string[]) {
  const now = new Date();
  await Promise.all(
    phaseIds.map((phaseId, index) =>
      database
        .update(phases)
        .set({ position: index, updatedAt: now })
        .where(and(eq(phases.id, phaseId), eq(phases.projectId, projectId))),
    ),
  );
  return listPhases(database, projectId);
}

async function deletePhase(database: Database, projectId: string, phaseId: string) {
  const [phase] = await database
    .delete(phases)
    .where(and(eq(phases.id, phaseId), eq(phases.projectId, projectId)))
    .returning({ id: phases.id });
  return phase;
}

async function listTasks(database: Database, projectId: string) {
  return database
    .select()
    .from(tasks)
    .where(eq(tasks.projectId, projectId))
    .orderBy(asc(tasks.position), asc(tasks.createdAt));
}

async function createTask(database: Database, projectId: string, input: CreateTaskInput) {
  const [task] = await database
    .insert(tasks)
    .values({
      id: crypto.randomUUID(),
      projectId,
      ...input,
      ...(input.status === TaskStatus.Completed ? { completedAt: new Date() } : {}),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  return task;
}

async function getTask(database: Database, projectId: string, taskId: string) {
  const [task] = await database
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)))
    .limit(1);
  return task;
}

async function updateTask(
  database: Database,
  projectId: string,
  taskId: string,
  input: UpdateTaskInput,
) {
  const completedAtPatch = getCompletedAtPatch(input.status);
  const [task] = await database
    .update(tasks)
    .set({
      ...input,
      ...completedAtPatch,
      updatedAt: new Date(),
    })
    .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)))
    .returning();
  return task;
}

function getCompletedAtPatch(status: TaskStatus | undefined) {
  if (status === undefined) {
    return {};
  }
  return {
    completedAt: status === TaskStatus.Completed ? new Date() : null,
  };
}

async function deleteTask(database: Database, projectId: string, taskId: string) {
  const [task] = await database
    .delete(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)))
    .returning({ id: tasks.id });
  return task;
}

async function taskInProject(database: Database, projectId: string, taskId: string) {
  const [task] = await database
    .select({ id: tasks.id })
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)))
    .limit(1);
  return Boolean(task);
}

async function dependencies(database: Database, projectId: string) {
  return database
    .select({
      id: taskDependencies.id,
      taskId: taskDependencies.taskId,
      dependsOnTaskId: taskDependencies.dependsOnTaskId,
      createdAt: taskDependencies.createdAt,
    })
    .from(taskDependencies)
    .innerJoin(tasks, eq(tasks.id, taskDependencies.taskId))
    .where(eq(tasks.projectId, projectId));
}

async function dependencyExists(database: Database, taskId: string, dependsOnTaskId: string) {
  const [dependency] = await database
    .select({ id: taskDependencies.id })
    .from(taskDependencies)
    .where(
      and(
        eq(taskDependencies.taskId, taskId),
        eq(taskDependencies.dependsOnTaskId, dependsOnTaskId),
      ),
    )
    .limit(1);
  return Boolean(dependency);
}

async function addDependency(database: Database, taskId: string, dependsOnTaskId: string) {
  const [dependency] = await database
    .insert(taskDependencies)
    .values({ id: crypto.randomUUID(), taskId, dependsOnTaskId, createdAt: new Date() })
    .returning();
  return dependency;
}

async function removeDependency(database: Database, taskId: string, dependsOnTaskId: string) {
  const [dependency] = await database
    .delete(taskDependencies)
    .where(
      and(
        eq(taskDependencies.taskId, taskId),
        eq(taskDependencies.dependsOnTaskId, dependsOnTaskId),
      ),
    )
    .returning({ id: taskDependencies.id });
  return dependency;
}
