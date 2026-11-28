import { z } from "zod";
import { Priority, TaskStatus } from "@repo/shared";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD dates");
export const taskStatusSchema = z.enum(TaskStatus);
export const taskPrioritySchema = z.enum(Priority);

export const createPhaseSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    description: z.string().trim().max(5000).nullable().optional(),
    position: z.number().int().min(0).optional(),
    startDate: dateSchema.nullable().optional(),
    dueDate: dateSchema.nullable().optional(),
    endDate: dateSchema.nullable().optional(),
    isOnHold: z.boolean().optional(),
  })
  .strict();
export const updatePhaseSchema = createPhaseSchema.partial();

export const reorderPhasesSchema = z
  .object({
    phaseIds: z.array(z.string().min(1)).min(1),
  })
  .strict();

export const createTaskSchema = z
  .object({
    phaseId: z.string().min(1).nullable().optional(),
    assigneeId: z.string().min(1).nullable().optional(),
    title: z.string().trim().min(1).max(300),
    description: z.string().trim().max(10000).nullable().optional(),
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    startDate: dateSchema.nullable().optional(),
    dueDate: dateSchema.nullable().optional(),
    estimatedMinutes: z.number().int().min(0).max(100000).nullable().optional(),
    actualMinutes: z.number().int().min(0).max(100000).nullable().optional(),
    position: z.number().int().min(0).optional(),
  })
  .strict();
export const updateTaskSchema = createTaskSchema.partial();
export const dependencySchema = z.object({ dependsOnTaskId: z.string().min(1) }).strict();
export type CreatePhaseInput = z.infer<typeof createPhaseSchema>;
export type UpdatePhaseInput = z.infer<typeof updatePhaseSchema>;
export type ReorderPhasesInput = z.infer<typeof reorderPhasesSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
