import { useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn, PageHeader, SectionTitle, phaseColors, statusClasses } from "./view-common";
import { DATE_LABELS, type Phase, type Project, type ProjectTab, type Task } from "@/lib/mock-data";

export function ProjectView({
  project,
  tab,
  onTabChange,
  onUpdate,
  onAssistant,
}: {
  project: Project;
  tab: ProjectTab;
  onTabChange: (tab: ProjectTab) => void;
  onUpdate: (project: Project) => void;
  onAssistant: () => void;
}) {
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [taskName, setTaskName] = useState("");
  const allTasks = project.phases.flatMap((phase) => phase.tasks);
  const toggleTask = (taskId: string) => {
    onUpdate({
      ...project,
      phases: project.phases.map((phase) => ({
        ...phase,
        tasks: phase.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: task.status === "Done" ? "To do" : "Done",
                progress: task.status === "Done" ? 0 : 100,
              }
            : task,
        ),
      })),
    });
  };
  const addTask = () => {
    if (!taskName.trim()) return;
    const phase = project.phases[1] ?? project.phases[0];
    const task: Task = {
      id: `task-${String(Date.now())}`,
      name: taskName,
      status: "To do",
      priority: "Medium",
      assignee: "AM",
      due: "15 Jan",
      start: 45,
      span: 8,
      progress: 0,
    };
    onUpdate({
      ...project,
      phases: project.phases.map((item) =>
        item.id === phase.id ? { ...phase, tasks: [...phase.tasks, task] } : item,
      ),
    });
    setTaskName("");
    setAddTaskOpen(false);
  };
  return (
    <div>
      <ProjectControls
        project={project}
        tab={tab}
        onTabChange={onTabChange}
        onAssistant={onAssistant}
        onAddTask={() => {
          setAddTaskOpen(true);
        }}
      />
      {tab === "overview" && (
        <ProjectOverview
          project={project}
          onTasks={() => {
            onTabChange("tasks");
          }}
        />
      )}
      {tab === "tasks" && (
        <TaskContent project={project} allTasks={allTasks} onToggle={toggleTask} />
      )}
      {tab === "timeline" && <Timeline project={project} />}
      {addTaskOpen && (
        <AddTaskModal
          taskName={taskName}
          onTaskNameChange={setTaskName}
          onClose={() => {
            setAddTaskOpen(false);
          }}
          onAdd={addTask}
        />
      )}
    </div>
  );
}

function ProjectControls({
  project,
  tab,
  onTabChange,
  onAssistant,
  onAddTask,
}: {
  project: Project;
  tab: ProjectTab;
  onTabChange: (tab: ProjectTab) => void;
  onAssistant: () => void;
  onAddTask: () => void;
}) {
  return (
    <>
      <PageHeader
        title={project.name}
        description={project.description}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={onAssistant}>
              <Sparkles />
              Ask AI
            </Button>
            <Button onClick={onAddTask}>
              <Plus />
              Add task
            </Button>
          </div>
        }
      />
      <div className="mb-5 flex flex-wrap items-center gap-4 text-xs text-[#77788a]">
        <Badge className={statusClasses[project.status]}>{project.status}</Badge>
        <div className="flex items-center gap-2">
          <Progress value={project.progress} className="h-1.5 w-36" />
          <span>{project.progress}% done</span>
        </div>
        <span>Start 3 Nov</span>
        <span>Target 30 Jan</span>
      </div>
      <div className="mb-5 flex gap-6 border-b border-[#e2e4ec]">
        {(["overview", "tasks", "timeline"] as const).map((item) => (
          <button
            key={item}
            onClick={() => {
              onTabChange(item);
            }}
            className={cn(
              "border-b-2 border-transparent pb-3 text-sm capitalize text-[#77788a]",
              tab === item && "border-[#7663c8] font-medium text-[#7663c8]",
            )}
          >
            {item}
          </button>
        ))}
      </div>
    </>
  );
}

function TaskContent({
  project,
  allTasks,
  onToggle,
}: {
  project: Project;
  allTasks: Task[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-5">
      {project.phases.map((phase) => (
        <PhaseGroup key={phase.id} phase={phase} onToggle={onToggle} />
      ))}
      {allTasks.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-[#77788a]">
          No tasks yet. Add the first task to get moving.
        </div>
      )}
    </div>
  );
}

function AddTaskModal({
  taskName,
  onTaskNameChange,
  onClose,
  onAdd,
}: {
  taskName: string;
  onTaskNameChange: (value: string) => void;
  onClose: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#25243a]/20 p-4">
      <div className="w-full max-w-md rounded-lg border border-[#e2e4ec] bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Add a task</h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
            ×
          </Button>
        </div>
        <label className="mt-4 block text-sm font-medium">
          Task name
          <Input
            autoFocus
            value={taskName}
            onChange={(event) => {
              onTaskNameChange(event.target.value);
            }}
            placeholder="e.g. Prepare launch checklist"
            className="mt-2"
          />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onAdd}>Add task</Button>
        </div>
      </div>
    </div>
  );
}

function PhaseGroup({ phase, onToggle }: { phase: Phase; onToggle: (id: string) => void }) {
  return (
    <section>
      <SectionTitle count={`${String(phase.tasks.length)} tasks`}>
        <span
          className="mr-2 inline-block size-2 rounded-full align-middle"
          style={{ backgroundColor: phaseColors[phase.tone] }}
        />
        {phase.name}
      </SectionTitle>
      <div className="overflow-hidden rounded-lg border border-[#e2e4ec] bg-white">
        {phase.tasks.map((task) => (
          <TaskRow key={task.id} task={task} onToggle={onToggle} />
        ))}
      </div>
    </section>
  );
}
function TaskRow({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[#e5e7ef] px-3 py-3 last:border-0 md:grid-cols-[1fr_76px_62px_38px_58px]">
      <div className="flex min-w-0 items-center gap-3">
        <Checkbox
          checked={task.status === "Done"}
          onCheckedChange={() => {
            onToggle(task.id);
          }}
        />
        <span
          className={cn(
            "truncate text-sm",
            task.status === "Done" && "text-[#858698] line-through",
          )}
        >
          {task.name}
        </span>
      </div>
      <Badge className={cn("hidden font-normal md:inline-flex", statusClasses[task.status])}>
        {task.status}
      </Badge>
      <span className="hidden text-xs text-[#77788a] md:block">{task.priority}</span>
      <span className="grid size-7 place-items-center rounded-full bg-[#edf2fa] text-[10px] font-medium text-[#6483b2]">
        {task.assignee}
      </span>
      <span className="text-right text-xs text-[#77788a]">{task.due}</span>
    </div>
  );
}
function ProjectOverview({ project, onTasks }: { project: Project; onTasks: () => void }) {
  const completed = project.phases
    .flatMap((phase) => phase.tasks)
    .filter((task) => task.status === "Done").length;
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
            <span>3 Nov 2026</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#77788a]">Target date</span>
            <span>30 Jan 2027</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#77788a]">Team</span>
            <span>Aisha, Sam, Jamie</span>
          </div>
        </div>
      </div>
    </div>
  );
}
function Timeline({ project }: { project: Project }) {
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
          <Button variant="outline" size="icon-sm" aria-label="Zoom out">
            -
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="Zoom in">
            +
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-[#e2e4ec] bg-white">
        <div className="min-w-[760px]">
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
            <div className="grid h-12 grid-cols-[155px_1fr] items-center">
              <div className="px-3 text-xs font-semibold">Beta release</div>
              <div className="relative h-full">
                <span className="absolute left-[96%] top-4 size-4 rotate-45 rounded-[2px] bg-[#7663c8]" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-[#8b8c9d]">
        Dependencies are drawn as grey connectors. Select a bar to see details.
      </p>
    </div>
  );
}

function TimelineRows({ project }: { project: Project }) {
  return (
    <>
      {project.phases.map((phase) => (
        <div key={phase.id}>
          <div className="border-b border-[#e5e7ef] bg-[#fbfbfd] px-3 py-2 text-xs font-semibold">
            {phase.name}
          </div>
          {phase.tasks.map((task) => (
            <div
              key={task.id}
              className="grid h-10 grid-cols-[155px_1fr] items-center border-b border-[#eef0f5]"
            >
              <div className="truncate px-3 text-xs">{task.name}</div>
              <div className="relative h-full">
                <div
                  className={cn(
                    "absolute top-2.5 h-5 rounded",
                    task.status === "Done" ? "bg-[#aeb9dc]" : "bg-[#d5cef0]",
                  )}
                  style={{ left: `${String(task.start)}%`, width: `${String(task.span)}%` }}
                >
                  <div
                    className="h-full rounded bg-[#7663c8]/45"
                    style={{ width: `${String(task.progress)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
