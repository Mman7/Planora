import { Plus } from "lucide-react";
import { TaskStatus } from "@repo/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getAllProjectTasks, type Project } from "@/lib/planner-types";
import { PageHeader, SectionTitle, cn, statusClasses } from "../view-common";

const toneClasses = {
  purple: "bg-[#7663c8]",
  teal: "bg-[#68aaa5]",
  orange: "bg-[#e2a44e]",
  pink: "bg-[#ca8aa8]",
};

export function DashboardView({
  onCreate,
  onProject,
  projects,
  userName,
  loading,
}: {
  onCreate: () => void;
  onProject: (id: string) => void;
  projects: Project[];
  userName: string;
  loading: boolean;
}) {
  const upcomingTasks = projects
    .flatMap((project) => getAllProjectTasks(project))
    .filter((task) => task.dueDate && task.status !== TaskStatus.Cancelled)
    .slice(0, 4);
  return (
    <div>
      <PageHeader
        title={`Good morning, ${userName}`}
        description="Pick up where you left off."
        action={
          <Button onClick={onCreate}>
            <Plus />
            Create Project
          </Button>
        }
      />
      <DashboardStats projects={projects} />
      <SectionTitle>Recent projects</SectionTitle>
      <div className="overflow-hidden rounded-lg border border-[#e2e4ec] bg-white">
        {loading && <DashboardLoading />}
        {!loading && projects.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm font-medium">No projects yet</p>
            <p className="mt-1 text-sm text-[#77788a]">Create your first project to get started.</p>
          </div>
        )}
        {!loading &&
          projects.map((project) => (
            <button
              key={project.id}
              onClick={() => {
                onProject(project.id);
              }}
              className="grid w-full grid-cols-[1fr_auto] items-center gap-4 border-b border-[#e5e7ef] px-4 py-3 text-left last:border-0 hover:bg-[#fbfbfe] md:grid-cols-[1fr_150px_165px]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className={cn("size-2.5 shrink-0 rounded-full", toneClasses[project.tone])} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{project.name}</p>
                  <p className="text-xs text-[#858698]">{project.edited}</p>
                </div>
              </div>
              <Badge
                className={cn(
                  "hidden justify-self-start font-normal md:inline-flex",
                  statusClasses[project.status],
                )}
              >
                {project.status}
              </Badge>
              <div className="flex items-center gap-3">
                <Progress value={project.progress} className="h-1.5 w-24 bg-[#eef0f5]" />
                <span className="w-8 text-right text-xs text-[#858698]">{project.progress}%</span>
              </div>
            </button>
          ))}
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div>
          <SectionTitle>Upcoming tasks</SectionTitle>
          <div className="overflow-hidden rounded-lg border border-[#e2e4ec] bg-white">
            {upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between border-b border-[#e5e7ef] px-4 py-3 last:border-0"
              >
                <span className="text-sm">{task.name}</span>
                <span className="text-xs text-[#77788a]">{task.dueDate}</span>
              </div>
            ))}
            {upcomingTasks.length === 0 && (
              <p className="px-4 py-3 text-sm text-[#77788a]">No upcoming tasks.</p>
            )}
          </div>
        </div>
        <div>
          <SectionTitle>Recent activity</SectionTitle>
          <div className="overflow-hidden rounded-lg border border-[#e2e4ec] bg-white">
            <p className="px-4 py-3 text-sm text-[#77788a]">No recent activity.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardStats({ projects }: { projects: Project[] }) {
  const tasks = projects
    .flatMap((project) => getAllProjectTasks(project))
    .filter((task) => task.status !== TaskStatus.Cancelled);
  const completedTasks = tasks.filter((task) => task.status === TaskStatus.Completed).length;
  const overdueTasks = tasks.filter(
    (task) =>
      task.status !== TaskStatus.Completed && task.dueDate && new Date(task.dueDate) < new Date(),
  ).length;
  const stats = [
    ["Active projects", projects.filter((project) => project.status !== "At risk").length],
    ["Active tasks", tasks.length - completedTasks],
    ["Completed tasks", completedTasks],
    ["Overdue tasks", overdueTasks],
  ] as const;
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-[#e2e4ec] bg-white px-4 py-3">
          <p className="text-xs text-[#77788a]">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
      ))}
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="space-y-3 px-4 py-4">
      <div className="h-4 w-2/3 animate-pulse rounded bg-[#eef0f5]" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-[#eef0f5]" />
      <div className="h-4 w-3/5 animate-pulse rounded bg-[#eef0f5]" />
    </div>
  );
}
