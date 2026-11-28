import { ArrowRight, Target } from "lucide-react";
import { TaskStatus } from "@repo/shared";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { CurrentUser } from "@/lib/auth";
import { getAllProjectTasks, type Project, type Task } from "@/lib/planner-types";

export function formatProjectDate(value?: string | null): string {
  if (!value) {
    return "Not set";
  }
  let date = new Date(value);
  if (isNaN(date.getTime()) || /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  }
  if (isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getTaskMemberName(task: Task, currentUser?: CurrentUser | null): string | null {
  const assignee = task.assignee.trim();
  if (assignee) {
    return assignee;
  }
  if (!task.assigneeId) {
    return null;
  }
  if (task.assigneeId === currentUser?.id) {
    return currentUser.name ? currentUser.name : "You";
  }
  return "Assigned";
}

export function getTeamMembers(project: Project, currentUser?: CurrentUser | null): string {
  const tasks = getAllProjectTasks(project);
  const members = new Set<string>();

  for (const task of tasks) {
    const member = getTaskMemberName(task, currentUser);
    if (member) {
      members.add(member);
    }
  }

  if (members.size > 0) {
    return Array.from(members).join(", ");
  }

  return currentUser?.name ?? "Unassigned";
}

export function ProjectOverview({
  project,
  onTasks,
  currentUser,
}: {
  project: Project;
  onTasks: () => void;
  currentUser?: CurrentUser | null;
}) {
  const allTasks = getAllProjectTasks(project);
  const completed = allTasks.filter((task) => task.status === TaskStatus.Completed).length;

  const phaseStartDates = project.phases
    .map((phase) => phase.startDate)
    .filter((date): date is string => Boolean(date))
    .sort();
  const phaseEndDates = project.phases
    .map((phase) => phase.dueDate)
    .filter((date): date is string => Boolean(date))
    .sort();

  const startDate = project.startDate ?? phaseStartDates[0];
  const targetDate = project.dueDate ?? phaseEndDates[phaseEndDates.length - 1];

  const startDateFormatted = formatProjectDate(startDate);
  const targetDateFormatted = formatProjectDate(targetDate);
  const teamMembers = getTeamMembers(project, currentUser);

  return (
    <div className="grid gap-5 md:grid-cols-[1.3fr_1fr]">
      <div className="rounded-lg border border-[#e2e4ec] bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#77788a]">Project health</p>
            <p className="mt-1 text-xl font-semibold">Making good progress</p>
          </div>
          <Target className="text-[#7663c8]" />
        </div>
        <Progress value={project.progress} className="mt-6 h-2" />
        <div className="mt-3 flex justify-between text-xs text-[#77788a]">
          <span>{completed} tasks complete</span>
          <span>{project.progress}%</span>
        </div>
        <Button variant="outline" className="mt-6" onClick={onTasks}>
          View tasks <ArrowRight />
        </Button>
      </div>
      <div className="rounded-lg border border-[#e2e4ec] bg-white p-5">
        <p className="text-sm font-semibold">Project details</p>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[#77788a]">Start date</span>
            <span>{startDateFormatted}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#77788a]">Target date</span>
            <span>{targetDateFormatted}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="shrink-0 text-[#77788a]">Team</span>
            <span className="truncate text-right" title={teamMembers}>
              {teamMembers}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
