"use client";

/* eslint-disable max-lines, max-lines-per-function */

import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Menu,
  Plus,
  Send,
  Settings as SettingsIcon,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  DATE_LABELS,
  PROJECTS,
  RECENT_ACTIVITY,
  UPCOMING_TASKS,
  type Phase,
  type Project,
  type ProjectTab,
  type Task,
  type View,
} from "@/lib/mock-data";

const navItems = [
  { id: "dashboard" as View, label: "Workspace", icon: LayoutDashboard },
  { id: "project" as View, label: "My Projects", icon: FolderKanban },
  { id: "assistant" as View, label: "Inbox", icon: Activity },
  { id: "create" as View, label: "Templates", icon: ListTodo },
  { id: "settings" as View, label: "Settings", icon: SettingsIcon },
];

const toneClasses = {
  purple: "bg-[#7663c8]",
  teal: "bg-[#68aaa5]",
  orange: "bg-[#e2a44e]",
  pink: "bg-[#ca8aa8]",
};

const statusClasses: Record<string, string> = {
  "In progress": "bg-[#e9f0fa] text-[#6483b2]",
  "On track": "bg-[#e8f4ec] text-[#568568]",
  "At risk": "bg-[#fbf2df] text-[#a7803d]",
  Done: "bg-[#e8f4ec] text-[#568568]",
  "To do": "bg-[#f0f2f7] text-[#77788a]",
};

const phaseColors = {
  teal: "#68aaa5",
  orange: "#e2a44e",
  pink: "#ca8aa8",
  purple: "#7663c8",
} as const;

function AppShell() {
  const [view, setView] = useState<View>("dashboard");
  const [projectTab, setProjectTab] = useState<ProjectTab>("tasks");
  const [projects, setProjects] = useState(PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState("mobile-app");
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [mobileAssistantOpen, setMobileAssistantOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const selectedProject =
    projects.find((project) => project.id === selectedProjectId) ?? projects[0];

  const navigate = (nextView: View) => {
    setView(nextView);
    setMobileNavOpen(false);
  };
  const openProject = (projectId: string, tab: ProjectTab = "tasks") => {
    setSelectedProjectId(projectId);
    setProjectTab(tab);
    setView("project");
  };
  const updateProject = (project: Project) => {
    setProjects((current) =>
      current.map((item) => (item.id === project.id ? project : item)),
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#25243a]">
      <div className="flex min-h-screen">
        <Sidebar activeView={view} onNavigate={navigate} />
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent side="left" className="w-[230px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <Sidebar activeView={view} onNavigate={navigate} mobile />
          </SheetContent>
        </Sheet>
        <main className="min-w-0 flex-1">
          <div className="flex items-center justify-between border-b border-[#e5e7ef] bg-white/70 px-4 py-3 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setMobileNavOpen(true);
              }}
              aria-label="Open navigation"
            >
              <Menu />
            </Button>
            <span className="font-semibold">Planly</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setMobileAssistantOpen(true);
              }}
              aria-label="Open assistant"
            >
              <Sparkles />
            </Button>
          </div>
          <div className="mx-auto max-w-[980px] px-4 py-6 md:px-8 md:py-8">
            {view === "dashboard" && (
              <Dashboard
                onCreate={() => {
                  navigate("create");
                }}
                onProject={openProject}
              />
            )}
            {view === "create" && (
              <CreateProject
                onGenerated={() => {
                  openProject("mobile-app");
                }}
              />
            )}
            {view === "project" && (
              <ProjectWorkspace
                project={selectedProject}
                tab={projectTab}
                onTabChange={setProjectTab}
                onUpdate={updateProject}
                onAssistant={() => {
                  navigate("assistant");
                }}
              />
            )}
            {view === "assistant" && (
              <AssistantView
                project={selectedProject}
                onApply={(project) => {
                  updateProject(project);
                  setProjectTab("tasks");
                  navigate("project");
                }}
              />
            )}
            {view === "settings" && <SettingsView />}
          </div>
        </main>
        <aside
          className={cn(
            "hidden w-[286px] shrink-0 border-l border-[#e5e7ef] bg-white xl:block",
            !assistantOpen && "w-14",
          )}
        >
          {assistantOpen ? (
            <AssistantPanel
              project={selectedProject}
              onClose={() => {
                setAssistantOpen(false);
              }}
              onOpenAssistant={() => {
                navigate("assistant");
              }}
            />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="m-3"
              onClick={() => {
                setAssistantOpen(true);
              }}
              aria-label="Open assistant"
            >
              <Sparkles />
            </Button>
          )}
        </aside>
        <Sheet open={mobileAssistantOpen} onOpenChange={setMobileAssistantOpen}>
          <SheetContent side="right" className="w-full max-w-[360px] p-0">
            <AssistantPanel
              project={selectedProject}
              onClose={() => {
                setMobileAssistantOpen(false);
              }}
              onOpenAssistant={() => {
                setMobileAssistantOpen(false);
                navigate("assistant");
              }}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

function Sidebar({
  activeView,
  onNavigate,
  mobile = false,
}: {
  activeView: View;
  onNavigate: (view: View) => void;
  mobile?: boolean;
}) {
  return (
    <aside
      className={cn(
        "flex w-[230px] shrink-0 flex-col border-r border-[#e5e7ef] bg-white px-3 py-5",
        mobile ? "min-h-full" : "hidden md:flex",
      )}
    >
      <button
        className="mb-8 flex items-center gap-2 px-3 text-left"
        onClick={() => {
          onNavigate("dashboard");
        }}
      >
        <span className="grid size-6 place-items-center rounded-md bg-[#f0edfa] text-[#7663c8]">
          <Sparkles size={14} />
        </span>
        <span className="font-semibold tracking-tight">Planly</span>
      </button>
      <nav className="space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              onNavigate(id);
            }}
            className={cn(
              "flex h-9 w-full items-center gap-3 rounded-md px-3 text-sm text-[#5f6075] transition-colors hover:bg-[#f5f3fc]",
              activeView === id && "bg-[#f0edfa] font-medium text-[#7663c8]",
            )}
          >
            <Icon size={16} strokeWidth={1.8} />
            {label}
          </button>
        ))}
      </nav>
      <div className="mt-auto flex items-center gap-3 border-t border-[#f0f1f5] px-3 pt-5">
        <span className="grid size-8 place-items-center rounded-full bg-[#e8e2fa] text-xs font-medium text-[#7663c8]">
          AM
        </span>
        <div>
          <p className="text-xs font-medium">Aisha Musa</p>
          <p className="text-[11px] text-[#858698]">Free plan</p>
        </div>
      </div>
    </aside>
  );
}

function PageHeader({
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
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.03em]">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-[13px] text-[#77788a]">{description}</p>
        )}
      </div>
      {action}
    </header>
  );
}
function SectionTitle({
  children,
  count,
}: {
  children: ReactNode;
  count?: string;
}) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <h2 className="text-[15px] font-semibold">{children}</h2>
      {count && <span className="text-xs text-[#8b8c9d]">{count}</span>}
    </div>
  );
}

function Dashboard({
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
              <span
                className={cn(
                  "size-2.5 shrink-0 rounded-full",
                  toneClasses[project.tone],
                )}
              />
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
              <Progress
                value={project.progress}
                className="h-1.5 w-24 bg-[#eef0f5]"
              />
              <span className="w-8 text-right text-xs text-[#858698]">
                {project.progress}%
              </span>
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

function CreateProject({ onGenerated }: { onGenerated: () => void }) {
  const [description, setDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const examples = [
    "Launch a podcast",
    "Redesign our website",
    "Plan a team offsite",
  ];
  const generate = () => {
    setGenerating(true);
    window.setTimeout(onGenerated, 500);
  };
  return (
    <div>
      <PageHeader
        title="Create your project"
        description="Describe it the way you would to a teammate. I will turn it into a plan."
      />
      <div className="rounded-lg border border-[#e2e4ec] bg-white p-4 md:p-5">
        <label htmlFor="project-description" className="text-sm font-semibold">
          What are you planning to build?
        </label>
        <Textarea
          id="project-description"
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
          }}
          placeholder="e.g. A mobile app for booking local fitness classes, launching in 3 months with a team of 4..."
          className="mt-3 min-h-[116px] resize-none"
        />
        <p className="mt-3 text-xs text-[#77788a]">Try an example</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {examples.map((example) => (
            <Button
              key={example}
              variant="outline"
              size="sm"
              onClick={() => {
                setDescription(example);
              }}
            >
              {example}
            </Button>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-4 rounded-lg border border-[#e2e4ec] bg-white p-4 md:grid-cols-3 md:p-5">
        <label className="text-xs font-medium">
          Project name (optional)
          <Input className="mt-2" placeholder="Let AI suggest one" />
        </label>
        <label className="text-xs font-medium">
          Target date (optional)
          <Input className="mt-2" placeholder="Pick a date" type="date" />
        </label>
        <label className="text-xs font-medium">
          Team size
          <Input className="mt-2" placeholder="Just me" />
        </label>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button onClick={generate} disabled={generating || !description.trim()}>
          {generating
            ? "Thinking through your plan..."
            : "Generate Project Plan"}
        </Button>
        {description && (
          <span className="text-xs text-[#77788a]">
            AI will suggest phases, tasks, and dates.
          </span>
        )}
      </div>
    </div>
  );
}

function ProjectWorkspace({
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
    const nextPhase: Phase = {
      ...phase,
      tasks: [
        ...phase.tasks,
        {
          id: `task-${String(Date.now())}`,
          name: taskName,
          status: "To do",
          priority: "Medium",
          assignee: "AM",
          due: "15 Jan",
          start: 45,
          span: 8,
          progress: 0,
        },
      ],
    };
    onUpdate({
      ...project,
      phases: project.phases.map((item) =>
        item.id === phase.id ? nextPhase : item,
      ),
    });
    setTaskName("");
    setAddTaskOpen(false);
  };
  let tabContent: ReactNode;
  if (tab === "timeline") {
    tabContent = <Timeline project={project} />;
  } else if (tab === "overview") {
    tabContent = (
      <Overview
        project={project}
        onTasks={() => {
          onTabChange("tasks");
        }}
      />
    );
  } else {
    tabContent = (
      <div className="space-y-5">
        {project.phases.map((phase) => (
          <PhaseGroup key={phase.id} phase={phase} onToggle={toggleTask} />
        ))}
        {allTasks.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-[#77788a]">
            No tasks yet. Add the first task to get moving.
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={project.name}
        description={project.description}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={onAssistant}>
              <Sparkles />
              Ask AI
            </Button>
            <Button
              onClick={() => {
                setAddTaskOpen(true);
              }}
            >
              <Plus />
              Add task
            </Button>
          </div>
        }
      />
      <div className="mb-5 flex flex-wrap items-center gap-4 text-xs text-[#77788a]">
        <Badge className={statusClasses[project.status]}>
          {project.status}
        </Badge>
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
      {tabContent}
      {addTaskOpen && (
        <Modal
          title="Add a task"
          onClose={() => {
            setAddTaskOpen(false);
          }}
        >
          <label className="text-sm font-medium">
            Task name
            <Input
              autoFocus
              value={taskName}
              onChange={(event) => {
                setTaskName(event.target.value);
              }}
              placeholder="e.g. Prepare launch checklist"
              className="mt-2"
            />
          </label>
          <div className="mt-5 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setAddTaskOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={addTask}>Add task</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function PhaseGroup({
  phase,
  onToggle,
}: {
  phase: Phase;
  onToggle: (id: string) => void;
}) {
  return (
    <section>
      <SectionTitle count={`${String(phase.tasks.length)} tasks`}>
        <span
          className="mr-2 inline-block size-2 rounded-full align-middle"
          style={{
            backgroundColor: phaseColors[phase.tone],
          }}
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
function TaskRow({
  task,
  onToggle,
}: {
  task: Task;
  onToggle: (id: string) => void;
}) {
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
      <Badge
        className={cn(
          "hidden font-normal md:inline-flex",
          statusClasses[task.status],
        )}
      >
        {task.status}
      </Badge>
      <span className="hidden text-xs text-[#77788a] md:block">
        {task.priority}
      </span>
      <span className="grid size-7 place-items-center rounded-full bg-[#edf2fa] text-[10px] font-medium text-[#6483b2]">
        {task.assignee}
      </span>
      <span className="text-right text-xs text-[#77788a]">{task.due}</span>
    </div>
  );
}

function Overview({
  project,
  onTasks,
}: {
  project: Project;
  onTasks: () => void;
}) {
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
                          task.status === "Done"
                            ? "bg-[#aeb9dc]"
                            : "bg-[#d5cef0]",
                        )}
                        style={{
                          left: `${String(task.start)}%`,
                          width: `${String(task.span)}%`,
                        }}
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

function AssistantPanel({
  project,
  onClose,
  onOpenAssistant,
}: {
  project: Project;
  onClose: () => void;
  onOpenAssistant: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[#f0f1f5] p-4">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-[#f0edfa] text-[#7663c8]">
            <Sparkles size={15} />
          </span>
          <div>
            <p className="text-sm font-semibold">Assistant</p>
            <p className="text-[11px] text-[#568568]">
              ● Ready · {project.name}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="xl:hidden"
          onClick={onClose}
          aria-label="Close assistant"
        >
          <X />
        </Button>
      </div>
      <div className="flex-1 space-y-3 p-4">
        <div className="rounded-lg bg-[#f0f2f7] p-3 text-xs leading-relaxed">
          Payments integration depends on the booking API. I can flag that
          dependency so dates stay realistic.
        </div>
        <Button
          variant="outline"
          className="w-full justify-start text-xs text-[#7663c8]"
          onClick={onOpenAssistant}
        >
          Suggest missing tasks
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-xs text-[#7663c8]"
          onClick={onOpenAssistant}
        >
          Check for risks
        </Button>
      </div>
      <div className="border-t border-[#f0f1f5] p-4">
        <div className="flex items-center gap-2 rounded-md border border-[#e2e4ec] px-3 py-2 text-xs text-[#8b8c9d]">
          Ask about your plan...
          <Send size={14} className="ml-auto" />
        </div>
      </div>
    </div>
  );
}

function AssistantView({
  project,
  onApply,
}: {
  project: Project;
  onApply: (project: Project) => void;
}) {
  const [proposal, setProposal] = useState(true);
  const proposedProject = useMemo(
    () => ({
      ...project,
      phases: [
        ...project.phases,
        {
          id: "testing",
          name: "Testing",
          tone: "pink" as const,
          tasks: [
            {
              id: "qa",
              name: "Beta testing",
              status: "To do" as const,
              priority: "High" as const,
              assignee: "AM",
              due: "16 Jan",
              start: 52,
              span: 8,
              progress: 0,
            },
            {
              id: "feedback",
              name: "Collect launch feedback",
              status: "To do" as const,
              priority: "Medium" as const,
              assignee: "SM",
              due: "20 Jan",
              start: 60,
              span: 6,
              progress: 0,
            },
          ],
        },
      ],
    }),
    [project],
  );
  return (
    <div>
      <PageHeader title="Assistant" description={project.name} />
      <div className="max-w-[620px] space-y-3">
        <div className="ml-auto w-fit rounded-lg bg-[#f0edfa] px-3 py-2 text-sm">
          Let&apos;s improve my project plan. What am I missing?
        </div>
        <div className="rounded-lg border border-[#e2e4ec] bg-white px-3 py-2 text-sm">
          Your plan has no testing phase before the beta release. Here is a
          proposal:
        </div>
        {proposal && (
          <div className="rounded-lg border border-[#e4dff5] bg-[#f0edfa] p-4">
            <h2 className="font-semibold">Add a testing phase</h2>
            <p className="mt-1 text-sm text-[#77788a]">
              Between Build and Beta release.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <Badge className="bg-white text-[#7663c8]">2 new tasks</Badge>
              <Badge className="bg-white text-[#7663c8]">
                2 new dependencies
              </Badge>
              <Badge className="bg-[#fbf2df] text-[#a7803d]">
                Timeline +1 week
              </Badge>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setProposal(false);
                }}
              >
                Reject
              </Button>
              <Button
                onClick={() => {
                  onApply(proposedProject);
                }}
              >
                Apply Changes
              </Button>
            </div>
          </div>
        )}
        <p className="text-xs text-[#8b8c9d]">
          Nothing changes in your plan until you apply.
        </p>
      </div>
    </div>
  );
}

function SettingsView() {
  const [saved, setSaved] = useState(false);
  const [weekly, setWeekly] = useState(false);
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your profile, workspace and preferences."
        action={
          <Button
            onClick={() => {
              setSaved(true);
            }}
          >
            {saved && <Check />}
            {saved ? "Changes saved" : "Save changes"}
          </Button>
        }
      />
      <div className="grid gap-6 md:grid-cols-[150px_1fr]">
        <nav className="space-y-2 text-sm text-[#77788a]">
          {[
            "Profile",
            "Workspace",
            "Working time",
            "Calendar",
            "AI provider",
            "Notifications",
            "Account",
          ].map((item, index) => (
            <button
              key={item}
              className={cn(
                "block w-full rounded-md px-3 py-2 text-left",
                index === 0 && "bg-[#f0edfa] font-medium text-[#7663c8]",
              )}
            >
              {item}
            </button>
          ))}
        </nav>
        <div className="space-y-4">
          <SettingsGroup title="Profile">
            <SettingRow label="Name" value="Aisha Musa" />
            <SettingRow label="Email" value="aisha@example.com" />
          </SettingsGroup>
          <SettingsGroup title="Working time">
            <SettingRow label="Working days" value="Mon – Fri" />
            <SettingRow label="Working hours" value="9:00 – 17:00" />
          </SettingsGroup>
          <SettingsGroup title="AI provider">
            <SettingRow label="Provider" value="Claude" />
            <SettingRow label="API key" value="Connected" />
          </SettingsGroup>
          <SettingsGroup title="Notifications">
            <SettingRow label="Due date reminders" value="On" />
            <div className="flex items-center justify-between border-t border-[#e5e7ef] px-3 py-3 text-sm">
              <span>Weekly summary</span>
              <button
                onClick={() => {
                  setWeekly(!weekly);
                }}
                className={cn(
                  "relative h-5 w-9 rounded-full transition-colors",
                  weekly ? "bg-[#7663c8]" : "bg-[#dfe2ea",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 size-4 rounded-full bg-white transition-transform",
                    weekly ? "translate-x-4" : "translate-x-0.5",
                  )}
                />
              </button>
            </div>
          </SettingsGroup>
        </div>
      </div>
    </div>
  );
}
function SettingsGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#e2e4ec] bg-white">
      <h2 className="border-b border-[#e5e7ef] px-3 py-3 text-sm font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}
function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#e5e7ef] px-3 py-3 text-sm last:border-0">
      <span>{label}</span>
      <span className="text-xs text-[#77788a]">{value}</span>
    </div>
  );
}
function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#25243a]/20 p-4">
      <div className="w-full max-w-md rounded-lg border border-[#e2e4ec] bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{title}</h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close"
          >
            <X />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Home() {
  return <AppShell />;
}
