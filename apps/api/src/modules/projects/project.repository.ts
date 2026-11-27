import { and, asc, count, desc, eq } from "drizzle-orm";
import { projects, type Database } from "@repo/database";
import type {
  CreateProjectInput,
  ProjectListQuery,
  UpdateProjectInput,
} from "./project.validation";

export function createProjectRepository(database: Database) {
  return {
    async create(ownerId: string, input: CreateProjectInput) {
      const now = new Date();
      const [project] = await database
        .insert(projects)
        .values({
          id: crypto.randomUUID(),
          ownerId,
          ...input,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      return project;
    },
    async findById(ownerId: string, projectId: string) {
      const [project] = await database
        .select()
        .from(projects)
        .where(and(eq(projects.id, projectId), eq(projects.ownerId, ownerId)))
        .limit(1);
      return project;
    },
    async list(ownerId: string, query: ProjectListQuery) {
      const filters = [eq(projects.ownerId, ownerId)];
      const orderColumns = {
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        name: projects.name,
        dueDate: projects.dueDate,
      } as const;
      if (query.status) filters.push(eq(projects.status, query.status));
      if (query.priority) filters.push(eq(projects.priority, query.priority));
      const orderColumn = orderColumns[query.sort];
      const order = query.direction === "asc" ? asc(orderColumn) : desc(orderColumn);
      const offset = (query.page - 1) * query.limit;
      const [items, totalRows] = await Promise.all([
        database
          .select()
          .from(projects)
          .where(and(...filters))
          .orderBy(order)
          .limit(query.limit)
          .offset(offset),
        database
          .select({ total: count() })
          .from(projects)
          .where(and(...filters)),
      ]);
      const total = totalRows[0]?.total ?? 0;
      return { items, total, page: query.page, limit: query.limit };
    },
    async update(ownerId: string, projectId: string, input: UpdateProjectInput) {
      const [project] = await database
        .update(projects)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(and(eq(projects.id, projectId), eq(projects.ownerId, ownerId)))
        .returning();
      return project;
    },
    async delete(ownerId: string, projectId: string) {
      const [project] = await database
        .delete(projects)
        .where(and(eq(projects.id, projectId), eq(projects.ownerId, ownerId)))
        .returning({ id: projects.id });
      return project;
    },
  };
}
