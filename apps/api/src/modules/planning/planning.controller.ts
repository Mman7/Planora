import type { Context } from "hono";
import { createDatabase } from "@repo/database";
import type { AppEnv } from "../../config/env";
import { NotFoundError } from "../../lib/errors";
import { successResponse } from "../../lib/response";
import { requireUserId } from "../auth/auth.session";
import { createPlanningService } from "./planning.service";
import {
  createPhaseSchema,
  createTaskSchema,
  dependencySchema,
  reorderPhasesSchema,
  updatePhaseSchema,
  updateTaskSchema,
} from "./planning.validation";

// Planning controller that handles HTTP requests for phases, tasks, and dependencies
function service(c: Context<AppEnv>) {
  return createPlanningService(createDatabase(c.env.DB));
}
// Helper function to extract route parameters and handle missing values
function id(c: Context<AppEnv>, name: string) {
  const value = c.req.param(name);
  if (!value) throw new NotFoundError("NOT_FOUND", "Route resource not found");
  return value;
}
// Controller function to list all phases for a given project
export async function listPhases(c: Context<AppEnv>) {
  return c.json(
    successResponse(await service(c).listPhases(await requireUserId(c), id(c, "projectId"))),
  );
}
// Controller function to create a new phase for a given project
export async function createPhase(c: Context<AppEnv>) {
  return c.json(
    successResponse(
      await service(c).createPhase(
        await requireUserId(c),
        id(c, "projectId"),
        createPhaseSchema.parse(await c.req.json()),
      ),
      "Phase created",
    ),
    201,
  );
}
// Controller function to get a specific phase by ID for a given project
export async function getPhase(c: Context<AppEnv>) {
  return c.json(
    successResponse(
      await service(c).getPhase(await requireUserId(c), id(c, "projectId"), id(c, "phaseId")),
    ),
  );
}
// Controller function to update a specific phase by ID for a given project
export async function updatePhase(c: Context<AppEnv>) {
  return c.json(
    successResponse(
      await service(c).updatePhase(
        await requireUserId(c),
        id(c, "projectId"),
        id(c, "phaseId"),
        updatePhaseSchema.parse(await c.req.json()),
      ),
      "Phase updated",
    ),
  );
}
// Controller function to reorder phases for a given project
export async function reorderPhases(c: Context<AppEnv>) {
  const input = reorderPhasesSchema.parse(await c.req.json());
  return c.json(
    successResponse(
      await service(c).reorderPhases(await requireUserId(c), id(c, "projectId"), input.phaseIds),
      "Phases reordered",
    ),
  );
}
// Controller function to delete a specific phase by ID for a given project
export async function deletePhase(c: Context<AppEnv>) {
  await service(c).deletePhase(await requireUserId(c), id(c, "projectId"), id(c, "phaseId"));
  return c.body(null, 204);
}
// Controller function to list all tasks for a given project
export async function listTasks(c: Context<AppEnv>) {
  return c.json(
    successResponse(await service(c).listTasks(await requireUserId(c), id(c, "projectId"))),
  );
}
// Controller function to create a new task for a given project
export async function createTask(c: Context<AppEnv>) {
  return c.json(
    successResponse(
      await service(c).createTask(
        await requireUserId(c),
        id(c, "projectId"),
        createTaskSchema.parse(await c.req.json()),
      ),
      "Task created",
    ),
    201,
  );
}
// Controller function to get a specific task by ID for a given project
export async function getTask(c: Context<AppEnv>) {
  return c.json(
    successResponse(
      await service(c).getTask(await requireUserId(c), id(c, "projectId"), id(c, "taskId")),
    ),
  );
}
// Controller function to update a specific task by ID for a given project
export async function updateTask(c: Context<AppEnv>) {
  return c.json(
    successResponse(
      await service(c).updateTask(
        await requireUserId(c),
        id(c, "projectId"),
        id(c, "taskId"),
        updateTaskSchema.parse(await c.req.json()),
      ),
      "Task updated",
    ),
  );
}
// Controller function to delete a specific task by ID for a given project
export async function deleteTask(c: Context<AppEnv>) {
  await service(c).deleteTask(await requireUserId(c), id(c, "projectId"), id(c, "taskId"));
  return c.body(null, 204);
}
// Controller function to list all task dependencies for a given project
export async function listDependencies(c: Context<AppEnv>) {
  return c.json(
    successResponse(await service(c).listDependencies(await requireUserId(c), id(c, "projectId"))),
  );
}
// Controller function to add a dependency between tasks for a given project
export async function addDependency(c: Context<AppEnv>) {
  return c.json(
    successResponse(
      await service(c).addDependency(
        await requireUserId(c),
        id(c, "projectId"),
        id(c, "taskId"),
        dependencySchema.parse(await c.req.json()).dependsOnTaskId,
      ),
      "Dependency added",
    ),
    201,
  );
}
// Controller function to remove a dependency between tasks for a given project
export async function removeDependency(c: Context<AppEnv>) {
  const input = dependencySchema.parse(await c.req.json());
  await service(c).removeDependency(
    await requireUserId(c),
    id(c, "projectId"),
    id(c, "taskId"),
    input.dependsOnTaskId,
  );
  return c.body(null, 204);
}
