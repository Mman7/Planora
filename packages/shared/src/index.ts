export enum ProjectStatus {
  Planning = "PLANNING",
  Active = "ACTIVE",
  OnHold = "ON_HOLD",
  Completed = "COMPLETED",
  Archived = "ARCHIVED",
}

export enum TaskStatus {
  Todo = "TODO",
  InProgress = "IN_PROGRESS",
  InReview = "IN_REVIEW",
  Completed = "COMPLETED",
  Cancelled = "CANCELLED",
}

export enum PhaseStatus {
  NotStarted = "NOT_STARTED",
  InProgress = "IN_PROGRESS",
  Completed = "COMPLETED",
  OnHold = "ON_HOLD",
}

export enum Priority {
  Low = "LOW",
  Medium = "MEDIUM",
  High = "HIGH",
  Urgent = "URGENT",
}

export type PhaseComputedStatus =
  PhaseStatus.NotStarted | PhaseStatus.InProgress | PhaseStatus.Completed;

export type TaskDependency = {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  createdAt: string;
};

export type DomainTask = {
  id: string;
  projectId: string;
  phaseId: string | null;
  status: TaskStatus;
  startDate: string | null;
  dueDate: string | null;
};

export type DomainPhase = {
  id: string;
  projectId: string;
  startDate: string | null;
  dueDate: string | null;
  isOnHold: boolean;
};

export * from "./domain/task/task-progress";
export * from "./domain/task/task-date-validation";
export * from "./domain/task/task-dependencies";
export * from "./domain/phase/phase-progress";
export * from "./domain/phase/phase-status";
export * from "./domain/phase/phase-date-validation";
export * from "./domain/project/project-progress";
