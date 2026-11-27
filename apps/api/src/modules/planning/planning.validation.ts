import { z } from "zod";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD dates");
export const taskStatusSchema = z.enum(["TODO", "IN_PROGRESS", "BLOCKED", "DONE", "CANCELLED"]);
export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const createPhaseSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    description: z.string().trim().max(5000).optional(),
    position: z.number().int().min(0).optional(),
    startDate: dateSchema.optional(),
    endDate: dateSchema.optional(),
  })
  .strict();
export const updatePhaseSchema = createPhaseSchema.partial();

export const createTaskSchema = z
  .object({
    phaseId: z.string().min(1).nullable().optional(),
    title: z.string().trim().min(1).max(300),
    description: z.string().trim().max(10000).optional(),
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    startDate: dateSchema.optional(),
    dueDate: dateSchema.optional(),
    estimatedMinutes: z.number().int().min(0).max(100000).optional(),
    actualMinutes: z.number().int().min(0).max(100000).optional(),
    position: z.number().int().min(0).optional(),
  })
  .strict();
export const updateTaskSchema = createTaskSchema.partial();
export const dependencySchema = z.object({ dependsOnTaskId: z.string().min(1) }).strict();
export type CreatePhaseInput = z.infer<typeof createPhaseSchema>;
export type UpdatePhaseInput = z.infer<typeof updatePhaseSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
