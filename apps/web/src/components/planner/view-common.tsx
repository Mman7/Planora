import type { ReactNode } from "react";
import { PhaseStatus, Priority, TaskStatus } from "@repo/shared";
import { cn } from "@/lib/utils";

const IN_PROGRESS_BADGE = "bg-[#e9f0fa] text-[#6483b2]";
const COMPLETED_BADGE = "bg-[#e8f4ec] text-[#568568]";
const WARNING_BADGE = "bg-[#fbf2df] text-[#a7803d]";
const NEUTRAL_BADGE = "bg-[#f0f2f7] text-[#77788a]";

export const statusClasses: Record<string, string> = {
  "In progress": IN_PROGRESS_BADGE,
  "On track": COMPLETED_BADGE,
  "At risk": WARNING_BADGE,
  [TaskStatus.Todo]: NEUTRAL_BADGE,
  [TaskStatus.InProgress]: IN_PROGRESS_BADGE,
  [TaskStatus.InReview]: "bg-[#f0edfa] text-[#7663c8]",
  [TaskStatus.Completed]: COMPLETED_BADGE,
  [TaskStatus.Cancelled]: "bg-[#f4f4f6] text-[#9b9cad] line-through",
};

export const phaseStatusClasses: Record<PhaseStatus, string> = {
  [PhaseStatus.NotStarted]: NEUTRAL_BADGE,
  [PhaseStatus.InProgress]: IN_PROGRESS_BADGE,
  [PhaseStatus.Completed]: COMPLETED_BADGE,
  [PhaseStatus.OnHold]: WARNING_BADGE,
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  [TaskStatus.Todo]: "To do",
  [TaskStatus.InProgress]: "In progress",
  [TaskStatus.InReview]: "In review",
  [TaskStatus.Completed]: "Completed",
  [TaskStatus.Cancelled]: "Cancelled",
};

export const phaseStatusLabels: Record<PhaseStatus, string> = {
  [PhaseStatus.NotStarted]: "Not started",
  [PhaseStatus.InProgress]: "In progress",
  [PhaseStatus.Completed]: "Completed",
  [PhaseStatus.OnHold]: "On hold",
};

export const priorityLabels: Record<Priority, string> = {
  [Priority.Low]: "Low",
  [Priority.Medium]: "Medium",
  [Priority.High]: "High",
  [Priority.Urgent]: "Urgent",
};

export const phaseColors = {
  teal: "#68aaa5",
  orange: "#e2a44e",
  pink: "#ca8aa8",
  purple: "#7663c8",
} as const;

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.03em]">{title}</h1>
        {description && <p className="mt-1 text-[13px] text-[#77788a]">{description}</p>}
      </div>
      {action}
    </header>
  );
}

export function SectionTitle({ children, count }: { children: ReactNode; count?: string }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <h2 className="text-[15px] font-semibold">{children}</h2>
      {count && <span className="text-xs text-[#8b8c9d]">{count}</span>}
    </div>
  );
}

export { cn };
