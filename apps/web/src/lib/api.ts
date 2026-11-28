import { API_URL } from "./auth";
import type {
  CreatePhasePayload,
  CreateTaskPayload,
  Phase,
  Project,
  Task,
  UpdatePhasePayload,
  UpdateTaskPayload,
} from "./planner-types";
import {
  Priority as ApiPriority,
  ProjectStatus as ApiProjectStatus,
  TaskStatus as ApiTaskStatus,
  PhaseStatus,
  calculatePhaseProgress,
  calculatePhaseStatus,
  calculateProjectProgress,
  type TaskDependency,
} from "@repo/shared";

export { ApiPriority, ApiProjectStatus, ApiTaskStatus, PhaseStatus };

enum ProjectDisplayStatus {
  InProgress = "In progress",
  OnTrack = "On track",
  AtRisk = "At risk",
}

enum ProjectTone {
  Purple = "purple",
  Teal = "teal",
  Orange = "orange",
}

enum PhaseTone {
  Teal = "teal",
  Purple = "purple",
  Orange = "orange",
  Pink = "pink",
}

type ApiResponse<T> = { success: true; data: T; message?: string };

export type ApiProject = {
  id: string;
  name: string;
  description: string | null;
  status: ApiProjectStatus;
  priority: ApiPriority;
  color: string | null;
  startDate: string | null;
  dueDate: string | null;
  updatedAt: string | number | Date;
};

export type ApiPhase = {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  position: number;
  startDate: string | null;
  dueDate?: string | null;
  endDate: string | null;
  isOnHold?: boolean;
};

export type ApiTask = {
  id: string;
  projectId: string;
  phaseId: string | null;
  assigneeId: string | null;
  title: string;
  description: string | null;
  status: ApiTaskStatus;
  priority: ApiPriority;
  startDate: string | null;
  dueDate: string | null;
  position: number;
  estimatedMinutes: number | null;
  completedAt: string | number | Date | null;
};

export type ApiDependency = {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  createdAt: string | number | Date;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body) headers.set("Content-Type", "application/json");
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      headers,
    });
  } catch (error) {
    throw new Error(`Unable to reach the API at ${API_URL}. ${getErrorMessage(error)}`);
  }
  const payload = (await response.json().catch(() => null)) as
    ApiResponse<T> | { error?: { message?: string }; message?: string } | null;
  if (!response.ok) {
    throw new Error(payload && "error" in payload ? payload.error?.message : "Request failed");
  }
  if (response.status === 204) return undefined as T;
  return (payload as ApiResponse<T>).data;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown network error";
}

export function listProjects() {
  return request<{ items: ApiProject[] }>("/api/projects");
}

export function createProject(input: { name: string; description?: string }) {
  return request<ApiProject>("/api/projects", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateProject(
  projectId: string,
  input: { name?: string; description?: string; startDate?: string; dueDate?: string },
) {
  return request<ApiProject>(`/api/projects/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteProject(projectId: string) {
  return request<undefined>(`/api/projects/${projectId}`, { method: "DELETE" });
}

export function listPhases(projectId: string) {
  return request<ApiPhase[]>(`/api/projects/${projectId}/phases`);
}

export function createPhase(projectId: string, input: CreatePhasePayload) {
  return request<ApiPhase>(`/api/projects/${projectId}/phases`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updatePhase(projectId: string, phaseId: string, input: UpdatePhasePayload) {
  return request<ApiPhase>(`/api/projects/${projectId}/phases/${phaseId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function reorderPhases(projectId: string, phaseIds: string[]) {
  return request<ApiPhase[]>(`/api/projects/${projectId}/phases/reorder`, {
    method: "PATCH",
    body: JSON.stringify({ phaseIds }),
  });
}

export function deletePhase(projectId: string, phaseId: string) {
  return request<undefined>(`/api/projects/${projectId}/phases/${phaseId}`, { method: "DELETE" });
}

export function listTasks(projectId: string) {
  return request<ApiTask[]>(`/api/projects/${projectId}/tasks`);
}

export function createTask(projectId: string, input: CreateTaskPayload) {
  return request<ApiTask>(`/api/projects/${projectId}/tasks`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateTask(projectId: string, taskId: string, input: UpdateTaskPayload) {
  return request<ApiTask>(`/api/projects/${projectId}/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteTask(projectId: string, taskId: string) {
  return request<undefined>(`/api/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" });
}

export function listDependencies(projectId: string) {
  return request<ApiDependency[]>(`/api/projects/${projectId}/dependencies`);
}

export function addDependency(projectId: string, taskId: string, dependsOnTaskId: string) {
  return request<ApiDependency>(`/api/projects/${projectId}/tasks/${taskId}/dependencies`, {
    method: "POST",
    body: JSON.stringify({ dependsOnTaskId }),
  });
}

export function removeDependency(projectId: string, taskId: string, dependsOnTaskId: string) {
  return request<undefined>(`/api/projects/${projectId}/tasks/${taskId}/dependencies`, {
    method: "DELETE",
    body: JSON.stringify({ dependsOnTaskId }),
  });
}

export function toProject(
  project: ApiProject,
  phases: ApiPhase[] = [],
  tasks: ApiTask[] = [],
  dependencies: ApiDependency[] = [],
): Project {
  const tone = getProjectTone(project.color) as Project["tone"];
  const mappedTasks = tasks.map((task) => toTask(task, project.id));
  const sortedPhases = [...phases].sort((a, b) => a.position - b.position);
  const mappedPhases: Phase[] = sortedPhases.map((phase, index) => {
    const phaseTasks = mappedTasks.filter((task) => task.phaseId === phase.id);
    const domainPhase = {
      id: phase.id,
      projectId: project.id,
      startDate: phase.startDate,
      dueDate: phase.dueDate ?? phase.endDate,
      isOnHold: Boolean(phase.isOnHold),
    };
    return {
      id: phase.id,
      projectId: project.id,
      name: phase.name,
      description: phase.description ?? null,
      position: phase.position,
      startDate: phase.startDate,
      dueDate: phase.dueDate ?? phase.endDate,
      isOnHold: Boolean(phase.isOnHold),
      status: calculatePhaseStatus(domainPhase, mappedTasks),
      progress: calculatePhaseProgress(phase.id, mappedTasks),
      tone: [PhaseTone.Teal, PhaseTone.Purple, PhaseTone.Orange, PhaseTone.Pink][index % 4],
      tasks: phaseTasks,
    };
  });

  const unassignedTasks = mappedTasks.filter((task) => task.phaseId === null);
  const mappedDependencies: TaskDependency[] = dependencies.map((dep) => ({
    id: dep.id,
    taskId: dep.taskId,
    dependsOnTaskId: dep.dependsOnTaskId,
    createdAt: dep.createdAt ? new Date(dep.createdAt).toISOString() : new Date().toISOString(),
  }));

  return {
    id: project.id,
    name: project.name,
    description: project.description ?? "",
    startDate: project.startDate ?? undefined,
    dueDate: project.dueDate ?? undefined,
    status: projectStatus(project.status),
    progress: calculateProjectProgress(mappedTasks),
    tone,
    edited: formatEdited(project.updatedAt),
    phases: mappedPhases,
    unassignedTasks,
    dependencies: mappedDependencies,
  };
}

function toTaskSchedule(task: ApiTask) {
  return {
    startDate: task.startDate ?? null,
    dueDate: task.dueDate ?? null,
    estimatedMinutes: task.estimatedMinutes ?? null,
    completedAt: task.completedAt ? new Date(task.completedAt).toISOString() : null,
    due: task.dueDate ?? "",
    start: 0,
    span: Math.max(6, Math.round((task.estimatedMinutes ?? 60) / 60)),
  };
}

export function toTask(task: ApiTask, projectId?: string): Task {
  return {
    id: task.id,
    projectId: task.projectId || (projectId ?? ""),
    phaseId: task.phaseId ?? null,
    name: task.title,
    assigneeId: task.assigneeId ?? null,
    description: task.description ?? null,
    status: task.status,
    priority: task.priority,
    assignee: "",
    position: task.position,
    progress: getTaskProgress(task.status),
    ...toTaskSchedule(task),
  };
}

export function recomputeProjectDerivedState(project: Project): Project {
  const allTasks = [...project.phases.flatMap((phase) => phase.tasks), ...project.unassignedTasks];
  const updatedPhases = project.phases.map((phase) => ({
    ...phase,
    status: calculatePhaseStatus(phase, allTasks),
    progress: calculatePhaseProgress(phase.id, allTasks),
  }));
  return {
    ...project,
    phases: updatedPhases,
    progress: calculateProjectProgress(allTasks),
  };
}

function getProjectTone(color: string | null): ProjectTone {
  const normalizedColor = color as unknown as ProjectTone | null;
  if (normalizedColor === ProjectTone.Teal) return ProjectTone.Teal;
  if (normalizedColor === ProjectTone.Orange) return ProjectTone.Orange;
  return ProjectTone.Purple;
}

function getTaskProgress(status: ApiTaskStatus) {
  if (status === ApiTaskStatus.Completed) return 100;
  if (status === ApiTaskStatus.InReview) return 75;
  if (status === ApiTaskStatus.InProgress) return 50;
  return 0;
}

function projectStatus(status: ApiProjectStatus): Project["status"] {
  if (status === ApiProjectStatus.Completed) return ProjectDisplayStatus.OnTrack;
  if (status === ApiProjectStatus.OnHold || status === ApiProjectStatus.Archived)
    return ProjectDisplayStatus.AtRisk;
  return ProjectDisplayStatus.InProgress;
}

function formatEdited(value: ApiProject["updatedAt"]) {
  return value ? `Updated ${new Date(value).toLocaleDateString()}` : "Recently updated";
}
