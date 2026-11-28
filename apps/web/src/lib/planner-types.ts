import type { PhaseStatus, Priority, TaskDependency, TaskStatus } from "@repo/shared";

export type View = "dashboard" | "create" | "project" | "assistant" | "settings";
export type ProjectTab = "overview" | "tasks" | "timeline" | "settings";

export type Task = {
  id: string;
  projectId: string;
  phaseId: string | null;
  name: string;
  assigneeId: string | null;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  assignee: string;
  startDate: string | null;
  dueDate: string | null;
  estimatedMinutes: number | null;
  completedAt: string | null;
  position: number;
  due: string;
  start: number;
  span: number;
  progress: number;
};

export type Phase = {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  position: number;
  startDate: string | null;
  dueDate: string | null;
  isOnHold: boolean;
  status: PhaseStatus;
  progress: number;
  tone: "teal" | "purple" | "orange" | "pink";
  tasks: Task[];
};

export type Project = {
  id: string;
  name: string;
  description: string;
  startDate?: string;
  dueDate?: string;
  status: "In progress" | "On track" | "At risk";
  progress: number;
  tone: "purple" | "teal" | "orange";
  edited: string;
  phases: Phase[];
  unassignedTasks: Task[];
  dependencies: TaskDependency[];
};

export type CreateTaskPayload = {
  title: string;
  description?: string | null;
  phaseId?: string | null;
  priority?: Priority;
  status?: TaskStatus;
  startDate?: string | null;
  dueDate?: string | null;
  estimatedMinutes?: number | null;
  assigneeId?: string | null;
};

export type UpdateTaskPayload = {
  title?: string;
  description?: string | null;
  phaseId?: string | null;
  priority?: Priority;
  status?: TaskStatus;
  startDate?: string | null;
  dueDate?: string | null;
  estimatedMinutes?: number | null;
  assigneeId?: string | null;
};

export type CreatePhasePayload = {
  name: string;
  description?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
};

export type UpdatePhasePayload = {
  name?: string;
  description?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  isOnHold?: boolean;
};

export const DATE_LABELS = ["Nov 24", "Dec 1", "Dec 8", "Dec 15", "Dec 22", "Dec 29"];

export function getAllProjectTasks(project: Project): Task[] {
  return [...project.phases.flatMap((phase) => phase.tasks), ...project.unassignedTasks];
}
