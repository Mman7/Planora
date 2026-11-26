export type PlannerView =
  "dashboard" | "create" | "projects" | "timeline" | "assistant" | "settings";

export type ProjectStatus = "In progress" | "On track" | "At risk";
export type TaskStatus = "Done" | "In progress" | "To do";
export type TaskPriority = "High" | "Medium";

export interface ProjectTask {
  id: string;
  title: string;
  phase: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
  startDate: string;
  duration: number;
  progress: number;
}

export interface ProjectPhase {
  id: string;
  name: string;
  color: "purple" | "teal" | "orange";
  taskIds: string[];
}

export interface PlannerProject {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  startDate: string;
  targetDate: string;
  updatedAt: string;
  phases: ProjectPhase[];
  tasks: ProjectTask[];
}

export interface UpcomingTask {
  title: string;
  dueDate: string;
}

export interface ActivityItem {
  actor: string;
  action: string;
  subject: string;
  time: string;
}

export interface AssistantProposal {
  title: string;
  description: string;
  tasks: number;
  dependencies: number;
  timeline: string;
}
