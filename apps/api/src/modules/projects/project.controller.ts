import type { Context } from "hono";
import type { AppEnv } from "../../config/env";
import { NotFoundError } from "../../lib/errors";
import { successResponse } from "../../lib/response";
import { requireUserId } from "../auth/auth.session";
import { createDatabase } from "@repo/database";
import {
  createProjectSchema,
  projectListQuerySchema,
  updateProjectSchema,
} from "./project.validation";
import { createProjectService } from "./project.service";

function serviceFor(c: Context<AppEnv>) {
  return createProjectService(createDatabase(c.env.DB));
}

function projectIdFrom(c: Context<AppEnv>) {
  const projectId = c.req.param("projectId");
  if (!projectId) throw new NotFoundError("PROJECT_NOT_FOUND", "Project not found");
  return projectId;
}

export async function listProjects(c: Context<AppEnv>) {
  const userId = await requireUserId(c);
  const query = projectListQuerySchema.parse(c.req.query());
  return c.json(successResponse(await serviceFor(c).list(userId, query)));
}

export async function createProject(c: Context<AppEnv>) {
  const userId = await requireUserId(c);
  const input = createProjectSchema.parse(await c.req.json());
  return c.json(successResponse(await serviceFor(c).create(userId, input), "Project created"), 201);
}

export async function getProject(c: Context<AppEnv>) {
  const userId = await requireUserId(c);
  const project = await serviceFor(c).findById(userId, projectIdFrom(c));
  return c.json(successResponse(project));
}

export async function updateProject(c: Context<AppEnv>) {
  const userId = await requireUserId(c);
  const input = updateProjectSchema.parse(await c.req.json());
  const project = await serviceFor(c).update(userId, projectIdFrom(c), input);
  return c.json(successResponse(project, "Project updated"));
}

export async function deleteProject(c: Context<AppEnv>) {
  const userId = await requireUserId(c);
  await serviceFor(c).delete(userId, projectIdFrom(c));
  return c.body(null, 204);
}
