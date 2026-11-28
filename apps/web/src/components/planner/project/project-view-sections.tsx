import { useState } from "react";
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Target } from "lucide-react";
import { TaskStatus } from "@repo/shared";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { CurrentUser } from "@/lib/auth";
import { DATE_LABELS, getAllProjectTasks, type Project, type Task } from "@/lib/planner-types";
import { cn } from "../view-common";

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

export function Timeline({ project }: { project: Project }) {
  const [offset, setOffset] = useState(0);
  const [zoom, setZoom] = useState("Weeks");
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => {
              setOffset(offset - 1);
            }}
            aria-label="Previous period"
          >
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="sm">
            Today
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => {
              setOffset(offset + 1);
            }}
            aria-label="Next period"
          >
            <ChevronRight />
          </Button>
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setZoom(zoom === "Weeks" ? "Months" : "Weeks");
            }}
          >
            {zoom}
            <ChevronDown />
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-[#e2e4ec] bg-white">
        <div className="min-w-190">
          <div className="grid grid-cols-[155px_1fr] border-b border-[#e5e7ef] text-xs text-[#77788a]">
            <div className="p-3">{offset === 0 ? "Nov 2026" : "Dec 2026"}</div>
            <div className="grid grid-cols-6">
              {DATE_LABELS.map((date) => (
                <div key={date} className="p-3 text-center">
                  {date}
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute bottom-0 left-[61%] top-0 border-l-2 border-[#7663c8]" />
            <div className="absolute left-[59.5%] top-2 rounded bg-[#7663c8] px-1.5 py-0.5 text-[10px] text-white">
              Today
            </div>
            <TimelineRows project={project} />
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-[#8b8c9d]">
        {project.dependencies.length} task dependencies tracked. Phase and task dates remain as
        explicitly entered.
      </p>
    </div>
  );
}

function TimelineRows({ project }: { project: Project }) {
  return (
    <>
      {project.phases.map((phase) => (
        <div key={phase.id}>
          <div className="flex items-center justify-between border-b border-[#e5e7ef] bg-[#fbfbfd] px-3 py-2 text-xs font-semibold">
            <span>{phase.name}</span>
            {(phase.startDate ?? phase.dueDate) && (
              <span className="font-normal text-[#77788a]">
                {formatProjectDate(phase.startDate)} – {formatProjectDate(phase.dueDate)}
              </span>
            )}
          </div>
          {phase.tasks.map((task) => (
            <TimelineTaskRow key={task.id} task={task} />
          ))}
        </div>
      ))}
      {project.unassignedTasks.length > 0 && (
        <div>
          <div className="border-b border-[#e5e7ef] bg-[#fbfbfd] px-3 py-2 text-xs font-semibold">
            Unassigned Tasks
          </div>
          {project.unassignedTasks.map((task) => (
            <TimelineTaskRow key={task.id} task={task} />
          ))}
        </div>
      )}
    </>
  );
}

function TimelineTaskRow({ task }: { task: Task }) {
  return (
    <div className="grid h-10 grid-cols-[155px_1fr] items-center border-b border-[#eef0f5]">
      <div className="truncate px-3 text-xs">{task.name}</div>
      <div className="relative flex h-full items-center px-3">
        <div
          className={cn(
            "h-5 rounded px-2 text-[10px] leading-5",
            task.status === TaskStatus.Completed ? "bg-[#aeb9dc]" : "bg-[#d5cef0]",
          )}
          style={{ width: `${String(Math.min(100, Math.max(15, task.span * 3)))}%` }}
        >
          {task.startDate || task.dueDate
            ? `${task.startDate ?? "—"} → ${task.dueDate ?? "—"}`
            : "Unscheduled"}
        </div>
      </div>
    </div>
  );
}
