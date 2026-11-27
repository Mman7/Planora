import type { Database } from "@repo/database";
import { ConflictError, NotFoundError } from "../../lib/errors";
import { createProjectRepository } from "./project.repository";
import type {
  CreateProjectInput,
  ProjectListQuery,
  UpdateProjectInput,
} from "./project.validation";

const PROJECT_NOT_FOUND = "Project not found";

function validateDateRange(startDate?: string, dueDate?: string) {
  if (startDate && dueDate && startDate > dueDate) {
    throw new ConflictError("INVALID_DATE_RANGE", "Start date must be before due date");
  }
}

export function createProjectService(database: Database) {
  const repository = createProjectRepository(database);
  const findProject = async (ownerId: string, projectId: string) => {
    const project = await repository.findById(ownerId, projectId);
    if (!project) throw new NotFoundError("PROJECT_NOT_FOUND", PROJECT_NOT_FOUND);
    return project;
  };

  return {
    async create(ownerId: string, input: CreateProjectInput) {
      validateDateRange(input.startDate, input.dueDate);
      return repository.create(ownerId, input);
    },
    list(ownerId: string, query: ProjectListQuery) {
      return repository.list(ownerId, query);
    },
    findById: findProject,
    async update(ownerId: string, projectId: string, input: UpdateProjectInput) {
      const current = await findProject(ownerId, projectId);
      validateDateRange(
        input.startDate ?? current.startDate ?? undefined,
        input.dueDate ?? current.dueDate ?? undefined,
      );
      const project = await repository.update(ownerId, projectId, input);
      if (!project) throw new NotFoundError("PROJECT_NOT_FOUND", PROJECT_NOT_FOUND);
      return project;
    },
    async delete(ownerId: string, projectId: string) {
      const deleted = await repository.delete(ownerId, projectId);
      if (!deleted) throw new NotFoundError("PROJECT_NOT_FOUND", PROJECT_NOT_FOUND);
      return deleted;
    },
  };
}
