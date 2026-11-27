import { z } from "zod";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD dates");

export const projectStatusSchema = z.enum([
  "PLANNING",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
  "ARCHIVED",
]);

export const projectPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const createProjectSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    description: z.string().trim().max(5000).optional(),
    color: z.string().trim().max(32).optional(),
    icon: z.string().trim().max(64).optional(),
    status: projectStatusSchema.optional(),
    priority: projectPrioritySchema.optional(),
    startDate: dateSchema.optional(),
    dueDate: dateSchema.optional(),
  })
  .strict();

export const updateProjectSchema = createProjectSchema.partial();

export const projectListQuerySchema = z
  .object({
    status: projectStatusSchema.optional(),
    priority: projectPrioritySchema.optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.enum(["createdAt", "updatedAt", "name", "dueDate"]).default("updatedAt"),
    direction: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectListQuery = z.infer<typeof projectListQuerySchema>;
