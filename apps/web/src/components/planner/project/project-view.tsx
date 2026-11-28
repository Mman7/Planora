import { useState } from "react";
import { Check, Copy, Plus, Sparkles, Trash2 } from "lucide-react";
import { TaskStatus } from "@repo/shared";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { CurrentUser } from "@/lib/auth";
import {
  getAllProjectTasks,
  type CreatePhasePayload,
  type CreateTaskPayload,
  type Project,
  type ProjectTab,
  type Task,
  type UpdatePhasePayload,
  type UpdateTaskPayload,
} from "@/lib/planner-types";
import { cn, PageHeader, statusClasses } from "../view-common";
import { CreateTaskDialog } from "./create-task-dialog";
import { PhaseFormDialog } from "./phase-dialogs";
import { ConfirmDialog } from "./phase-group";
import { formatProjectDate, ProjectOverview } from "./project-overview";
import { ProjectSettings } from "./project-settings";
import { TaskContent } from "./project-task";
import { TaskDetailsDialog } from "./task-details-dialog";
import { Timeline } from "./project-timeline";
import { ProjectKanban } from "./project-kanban";

export function ProjectView({
  project,
  projects,
  currentUser,
  tab,
  onTabChange,
  onAddTask,
  onToggleTask,
  onAddPhase,
  onUpdateProject,
  onDeleteProject,
  onUpdatePhase,
  onReorderPhases,
  onDeletePhase,
  onUpdateTask,
  onDeleteTask,
  onAddDependency,
  onRemoveDependency,
  onAssistant,
}: {
  project: Project;
  projects: Project[];
  currentUser: CurrentUser | null;
  tab: ProjectTab;
  onTabChange: (tab: ProjectTab) => void;
  onAddTask: (projectId: string, input: CreateTaskPayload) => Promise<void>;
  onToggleTask: (task: Task) => Promise<void>;
  onAddPhase: (input: CreatePhasePayload) => Promise<string>;
  onUpdateProject: (name: string, description: string, dueDate: string | null) => Promise<void>;
  onDeleteProject: () => Promise<void>;
  onUpdatePhase: (phaseId: string, input: UpdatePhasePayload) => Promise<void>;
  onReorderPhases: (phaseIds: string[]) => Promise<void>;
  onDeletePhase: (phaseId: string) => Promise<void>;
  onUpdateTask: (task: Task, input: UpdateTaskPayload) => Promise<void>;
  onDeleteTask: (task: Task) => Promise<void>;
  onAddDependency: (taskId: string, dependsOnTaskId: string) => Promise<void>;
  onRemoveDependency: (taskId: string, dependsOnTaskId: string) => Promise<void>;
  onAssistant: () => void;
}) {
  const [createTaskContext, setCreateTaskContext] = useState({ open: false, phaseId: null as string | null, status: TaskStatus.Todo });
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null); const allTasks = getAllProjectTasks(project);
  const selectedTask = allTasks.find((item) => item.id === selectedTaskId) ?? null; const openCreateTask = (phaseId: string | null, status = TaskStatus.Todo) => {
    setCreateTaskContext({ open: true, phaseId, status });
  };

  return (
    <div>
      <ProjectControls
        project={project}
        tab={tab}
        onTabChange={onTabChange}
        onAssistant={onAssistant}
        onAddPhase={onAddPhase}
        onDeleteProject={onDeleteProject}
        onAddTask={() => {
          openCreateTask(null);
        }}
      />
      <ProjectTabBody
        tab={tab}
        project={project}
        allTasks={allTasks}
        currentUser={currentUser}
        onUpdateTask={onUpdateTask}
        onTabChange={onTabChange}
        onUpdateProject={onUpdateProject}
        onToggleTask={onToggleTask}
        onSelectTask={(task) => {
          setSelectedTaskId(task.id);
        }}
        onDeleteTask={onDeleteTask}
        onAddTaskInPhase={(phaseId) => {
          openCreateTask(phaseId);
        }}
        onUpdatePhase={onUpdatePhase}
        onReorderPhases={onReorderPhases}
        onDeletePhase={onDeletePhase}
        onAddTask={(status) => {
          openCreateTask(null, status);
        }}
      />
      <ProjectViewModals
        project={project}
        projects={projects}
        currentUser={currentUser}
        createTaskContext={createTaskContext}
        selectedTask={selectedTask}
        onCloseCreateTask={() => {
          setCreateTaskContext({ open: false, phaseId: null, status: TaskStatus.Todo });
        }}
        onCloseTaskDetails={() => {
          setSelectedTaskId(null);
        }}
        onAddTask={onAddTask}
        onUpdateTask={onUpdateTask}
        onAddDependency={onAddDependency}
        onRemoveDependency={onRemoveDependency}
      />
    </div>
  );
}

function ProjectTabBody({
  tab,
  project,
  allTasks,
  currentUser,
  onUpdateTask,
  onTabChange,
  onUpdateProject,
  onToggleTask,
  onSelectTask,
  onDeleteTask,
  onAddTaskInPhase,
  onUpdatePhase,
  onReorderPhases,
  onDeletePhase,
  onAddTask,
}: {
  tab: ProjectTab;
  project: Project;
  allTasks: Task[];
  currentUser: CurrentUser | null;
  onUpdateTask: (task: Task, input: UpdateTaskPayload) => Promise<void>;
  onTabChange: (tab: ProjectTab) => void;
  onUpdateProject: (name: string, description: string, dueDate: string | null) => Promise<void>;
  onToggleTask: (task: Task) => Promise<void>;
  onSelectTask: (task: Task) => void;
  onDeleteTask: (task: Task) => Promise<void>;
  onAddTaskInPhase: (phaseId: string | null) => void;
  onUpdatePhase: (phaseId: string, input: UpdatePhasePayload) => Promise<void>;
  onReorderPhases: (phaseIds: string[]) => Promise<void>;
  onDeletePhase: (phaseId: string) => Promise<void>;
  onAddTask: (status: Task["status"]) => void;
}) {
  if (tab === "overview") {
    return (
      <ProjectOverview
        project={project}
        currentUser={currentUser}
        onTasks={() => {
          onTabChange("tasks");
        }}
      />
    );
  }
  if (tab === "timeline") {
    return <Timeline project={project} onUpdateTask={onUpdateTask} />;
  }
  if (tab === "kanban") {
    return (
      <ProjectKanban
        key={allTasks.map((task) => `${task.id}:${task.status}:${String(task.position)}`).join("|")}
        project={project}
        tasks={allTasks}
        currentUser={currentUser}
        onSelectTask={onSelectTask}
        onAddTask={onAddTask}
        onUpdateTask={onUpdateTask}
      />
    );
  }
  if (tab === "settings") {
    return <ProjectSettings project={project} onSave={onUpdateProject} />;
  }
  return (
    <TaskContent
      project={project}
      allTasks={allTasks}
      onToggle={onToggleTask}
      onSelectTask={onSelectTask}
      onDelete={onDeleteTask}
      onAddTaskInPhase={onAddTaskInPhase}
      onUpdatePhase={onUpdatePhase}
      onReorderPhases={onReorderPhases}
      onDeletePhase={onDeletePhase}
      currentUserId={currentUser?.id}
    />
  );
}

function ProjectViewModals({
  project,
  projects,
  currentUser,
  createTaskContext,
  selectedTask,
  onCloseCreateTask,
  onCloseTaskDetails,
  onAddTask,
  onUpdateTask,
  onAddDependency,
  onRemoveDependency,
}: {
  project: Project;
  projects: Project[];
  currentUser: CurrentUser | null;
  createTaskContext: { open: boolean; phaseId: string | null; status: TaskStatus };
  selectedTask: Task | null;
  onCloseCreateTask: () => void;
  onCloseTaskDetails: () => void;
  onAddTask: (projectId: string, input: CreateTaskPayload) => Promise<void>;
  onUpdateTask: (task: Task, input: UpdateTaskPayload) => Promise<void>;
  onAddDependency: (taskId: string, dependsOnTaskId: string) => Promise<void>;
  onRemoveDependency: (taskId: string, dependsOnTaskId: string) => Promise<void>;
}) {
  return (
    <>
      {createTaskContext.open && (
        <CreateTaskDialog
          projects={projects}
          defaultProjectId={project.id}
          defaultPhaseId={createTaskContext.phaseId}
          defaultStatus={createTaskContext.status}
          currentUser={currentUser}
          onClose={onCloseCreateTask}
          onCreate={onAddTask}
        />
      )}
      {selectedTask && (
        <TaskDetailsDialog
          task={selectedTask}
          project={project}
          currentUser={currentUser}
          onClose={onCloseTaskDetails}
          onSave={onUpdateTask}
          onAddDependency={onAddDependency}
          onRemoveDependency={onRemoveDependency}
        />
      )}
    </>
  );
}

function ProjectControlButtons({
  project,
  onDelete,
  onAssistant,
  onAddTask,
  onAddPhase,
}: {
  project: Project;
  onDelete: () => void;
  onAssistant: () => void;
  onAddTask: () => void;
  onAddPhase: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyProjectJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(project, null, 2));
    setCopied(true);
    window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="ghost" size="icon" onClick={onDelete} title="Delete project">
        <Trash2 />
      </Button>
      <Button variant="outline" onClick={onAssistant}>
        <Sparkles />
        Ask AI
      </Button>
      <Button variant="outline" onClick={() => void copyProjectJson()}>
        {copied ? <Check /> : <Copy />}
        {copied ? "Copied" : "Copy JSON"}
      </Button>
      <Button onClick={onAddTask}>
        <Plus />
        Add task
      </Button>
      <Button variant="outline" onClick={onAddPhase}>
        <Plus />
        Add phase
      </Button>
    </div>
  );
}

function ProjectControls({
  project,
  tab,
  onTabChange,
  onAssistant,
  onAddTask,
  onAddPhase,
  onDeleteProject,
}: {
  project: Project;
  tab: ProjectTab;
  onTabChange: (tab: ProjectTab) => void;
  onAssistant: () => void;
  onAddTask: () => void;
  onAddPhase: (input: CreatePhasePayload) => Promise<string>;
  onDeleteProject: () => Promise<void>;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addPhaseOpen, setAddPhaseOpen] = useState(false);
  return (
    <>
      <PageHeader
        title={project.name}
        description={project.description}
        action={
          <ProjectControlButtons
            project={project}
            onDelete={() => {
              setDeleteOpen(true);
            }}
            onAssistant={onAssistant}
            onAddTask={onAddTask}
            onAddPhase={() => {
              setAddPhaseOpen(true);
            }}
          />
        }
      />
      <ProjectMeta project={project} tab={tab} onTabChange={onTabChange} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${project.name}?`}
        description="This will permanently delete the project, phases, and tasks."
        onConfirm={onDeleteProject}
      />
      {addPhaseOpen && (
        <PhaseFormDialog
          title="Add a phase"
          submitLabel="Add phase"
          onClose={() => {
            setAddPhaseOpen(false);
          }}
          onSubmit={async (input) => {
            await onAddPhase(input);
          }}
        />
      )}
    </>
  );
}

function ProjectMeta({
  project,
  tab,
  onTabChange,
}: {
  project: Project;
  tab: ProjectTab;
  onTabChange: (tab: ProjectTab) => void;
}) {
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-4 text-xs text-[#77788a]">
        <Badge className={statusClasses[project.status]}>{project.status}</Badge>
        <div className="flex items-center gap-2">
          <Progress value={project.progress} className="h-1.5 w-36" />
          <span>{project.progress}% done</span>
        </div>
        <span>Start {formatProjectDate(project.startDate)}</span>
        <span>Target {formatProjectDate(project.dueDate)}</span>
      </div>
      <div className="mb-5 flex gap-6 border-b border-[#e2e4ec]">
        {(["overview", "tasks", "kanban", "timeline", "settings"] as const).map((item) => (
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
