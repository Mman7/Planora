import { Hono } from "hono";
import type { AppEnv } from "../../config/env";
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject,
} from "./project.controller";

export const projectRoutes = new Hono<AppEnv>();
const PROJECT_PATH = "/:projectId";

projectRoutes.get("/", listProjects);
projectRoutes.post("/", createProject);
projectRoutes.get(PROJECT_PATH, getProject);
projectRoutes.patch(PROJECT_PATH, updateProject);
projectRoutes.delete(PROJECT_PATH, deleteProject);
