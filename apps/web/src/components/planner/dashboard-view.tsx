import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PROJECTS, RECENT_ACTIVITY, UPCOMING_TASKS } from "@/lib/mock-data";
import { PageHeader, SectionTitle, cn, statusClasses } from "./view-common";

const toneClasses = {
  purple: "bg-[#7663c8]",
  teal: "bg-[#68aaa5]",
  orange: "bg-[#e2a44e]",
  pink: "bg-[#ca8aa8]",
};

export function DashboardView({
  onCreate,
  onProject,
}: {
  onCreate: () => void;
  onProject: (id: string) => void;
}) {
  return (
    <div>
      <PageHeader
        title="Good morning, Aisha"
        description="Pick up where you left off."
        action={
          <Button onClick={onCreate}>
            <Plus />
            Create Project
          </Button>
        }
      />
      <SectionTitle>Recent projects</SectionTitle>
      <div className="overflow-hidden rounded-lg border border-[#e2e4ec] bg-white">
        {PROJECTS.map((project) => (
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
            {UPCOMING_TASKS.map(([task, date]) => (
              <div
                key={task}
                className="flex items-center justify-between border-b border-[#e5e7ef] px-4 py-3 last:border-0"
              >
                <span className="text-sm">{task}</span>
                <span className="text-xs text-[#77788a]">{date}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionTitle>Recent activity</SectionTitle>
          <div className="overflow-hidden rounded-lg border border-[#e2e4ec] bg-white">
            {RECENT_ACTIVITY.map(([prefix, subject, date]) => (
              <div
                key={subject}
                className="flex items-center justify-between gap-3 border-b border-[#e5e7ef] px-4 py-3 last:border-0"
              >
                <span className="text-sm">
                  {prefix} <strong className="font-medium">{subject}</strong>
                </span>
                <span className="shrink-0 text-xs text-[#77788a]">{date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
