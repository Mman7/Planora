import { useState } from "react";
import { Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { cn, PageHeader, phaseColors, SectionTitle, statusClasses } from "../view-common";
import { CreateTaskDialog } from "./create-task-dialog";
import { PhaseFormDialog } from "./phase-dialogs";
import { ConfirmDialog, PhaseGroup, TaskRow } from "./phase-group";
import { formatProjectDate, ProjectOverview, Timeline } from "./project-view-sections";
import { TaskDetailsDialog } from "./task-details-dialog";

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
  onUpdateProject: (name: string, description?: string) => Promise<void>;
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
  const [createTaskContext, setCreateTaskContext] = useState<{
    open: boolean;
    phaseId: string | null;
  }>({ open: false, phaseId: null });
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const allTasks = getAllProjectTasks(project);
  const selectedTask = allTasks.find((item) => item.id === selectedTaskId) ?? null;

  return (
    <div>
      <ProjectControls
        project={project}
        tab={tab}
        onTabChange={onTabChange}
        onAssistant={onAssistant}
        onAddPhase={onAddPhase}
        onUpdateProject={onUpdateProject}
        onDeleteProject={onDeleteProject}
        onAddTask={() => {
          setCreateTaskContext({ open: true, phaseId: null });
        }}
      />
      <ProjectTabBody
        tab={tab}
        project={project}
        allTasks={allTasks}
        currentUser={currentUser}
        onTabChange={onTabChange}
        onToggleTask={onToggleTask}
        onSelectTask={(task) => {
          setSelectedTaskId(task.id);
        }}
        onDeleteTask={onDeleteTask}
        onAddTaskInPhase={(phaseId) => {
          setCreateTaskContext({ open: true, phaseId });
        }}
        onUpdatePhase={onUpdatePhase}
        onReorderPhases={onReorderPhases}
        onDeletePhase={onDeletePhase}
      />
      <ProjectViewModals
        project={project}
        projects={projects}
        currentUser={currentUser}
        createTaskContext={createTaskContext}
        selectedTask={selectedTask}
        onCloseCreateTask={() => {
          setCreateTaskContext({ open: false, phaseId: null });
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
  onTabChange,
  onToggleTask,
  onSelectTask,
  onDeleteTask,
  onAddTaskInPhase,
  onUpdatePhase,
  onReorderPhases,
  onDeletePhase,
}: {
  tab: ProjectTab;
  project: Project;
  allTasks: Task[];
  currentUser: CurrentUser | null;
  onTabChange: (tab: ProjectTab) => void;
  onToggleTask: (task: Task) => Promise<void>;
  onSelectTask: (task: Task) => void;
  onDeleteTask: (task: Task) => Promise<void>;
  onAddTaskInPhase: (phaseId: string | null) => void;
  onUpdatePhase: (phaseId: string, input: UpdatePhasePayload) => Promise<void>;
  onReorderPhases: (phaseIds: string[]) => Promise<void>;
  onDeletePhase: (phaseId: string) => Promise<void>;
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
    return <Timeline project={project} />;
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
  createTaskContext: { open: boolean; phaseId: string | null };
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
  onEdit,
  onDelete,
  onAssistant,
  onAddTask,
  onAddPhase,
}: {
  onEdit: () => void;
  onDelete: () => void;
  onAssistant: () => void;
  onAddTask: () => void;
  onAddPhase: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="ghost" size="icon" onClick={onEdit} title="Edit project">
        <Pencil />
      </Button>
      <Button variant="ghost" size="icon" onClick={onDelete} title="Delete project">
        <Trash2 />
      </Button>
      <Button variant="outline" onClick={onAssistant}>
        <Sparkles />
        Ask AI
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
  onUpdateProject,
  onDeleteProject,
}: {
  project: Project;
  tab: ProjectTab;
  onTabChange: (tab: ProjectTab) => void;
  onAssistant: () => void;
  onAddTask: () => void;
  onAddPhase: (input: CreatePhasePayload) => Promise<string>;
  onUpdateProject: (name: string, description?: string) => Promise<void>;
  onDeleteProject: () => Promise<void>;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addPhaseOpen, setAddPhaseOpen] = useState(false);
  return (
    <>
      <PageHeader
        title={project.name}
        description={project.description}
        action={
          <ProjectControlButtons
            onEdit={() => {
              setEditOpen(true);
            }}
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
      {editOpen && (
        <EditProjectDialog
          project={project}
          onClose={() => {
            setEditOpen(false);
          }}
          onSave={async (name, description) => {
            await onUpdateProject(name, description);
            setEditOpen(false);
          }}
        />
      )}
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

function EditProjectDialog({
  project,
  onClose,
  onSave,
}: {
  project: Project;
  onClose: () => void;
  onSave: (name: string, description: string) => Promise<void>;
}) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit project</DialogTitle>
          <DialogDescription>Update the project details.</DialogDescription>
        </DialogHeader>
        <label className="block text-sm font-medium">
          Project name
          <Input
            autoFocus
            value={name}
            onChange={(event) => {
              setName(event.target.value);
            }}
            className="mt-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Description
          <Input
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
            }}
            className="mt-2"
          />
        </label>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!name.trim()}
            onClick={() => {
              void onSave(name.trim(), description);
            }}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TaskContent({
  project,
  allTasks,
  onToggle,
  onSelectTask,
  onDelete,
  onAddTaskInPhase,
  onUpdatePhase,
  onReorderPhases,
  onDeletePhase,
  currentUserId,
}: {
  project: Project;
  allTasks: Task[];
  onToggle: (task: Task) => Promise<void>;
  onSelectTask: (task: Task) => void;
  onDelete: (task: Task) => Promise<void>;
  onAddTaskInPhase: (phaseId: string | null) => void;
  onUpdatePhase: (phaseId: string, input: UpdatePhasePayload) => Promise<void>;
  onReorderPhases: (phaseIds: string[]) => Promise<void>;
  onDeletePhase: (phaseId: string) => Promise<void>;
  currentUserId?: string;
}) {
  const [draggedPhaseId, setDraggedPhaseId] = useState<string | null>(null);

  const movePhase = (phaseId: string, direction: -1 | 1) => {
    const index = project.phases.findIndex((item) => item.id === phaseId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= project.phases.length) return;
    const ids = project.phases.map((item) => item.id);
    const [moved] = ids.splice(index, 1);
    if (!moved) return;
    ids.splice(targetIndex, 0, moved);
    void onReorderPhases(ids);
  };

  const dropOnPhase = (targetPhaseId: string) => {
    if (!draggedPhaseId || draggedPhaseId === targetPhaseId) return;
    const ids = project.phases.map((item) => item.id);
    const fromIdx = ids.indexOf(draggedPhaseId);
    const toIdx = ids.indexOf(targetPhaseId);
    if (fromIdx < 0 || toIdx < 0) return;
    const [moved] = ids.splice(fromIdx, 1);
    if (!moved) return;
    ids.splice(toIdx, 0, moved);
    setDraggedPhaseId(null);
    void onReorderPhases(ids);
  };

  return (
    <div className="space-y-6">
      {project.phases.map((phase, index) => (
        <PhaseGroup
          key={phase.id}
          phase={phase}
          project={project}
          allTasks={allTasks}
          isFirst={index === 0}
          isLast={index === project.phases.length - 1}
          onDragStart={() => {
            setDraggedPhaseId(phase.id);
          }}
          onDrop={() => {
            dropOnPhase(phase.id);
          }}
          onMoveUp={() => {
            movePhase(phase.id, -1);
          }}
          onMoveDown={() => {
            movePhase(phase.id, 1);
          }}
          onAddTask={() => {
            onAddTaskInPhase(phase.id);
          }}
          onToggle={onToggle}
          onSelectTask={onSelectTask}
          onDelete={onDelete}
          onUpdatePhase={onUpdatePhase}
          onDeletePhase={onDeletePhase}
          currentUserId={currentUserId}
        />
      ))}
      <UnassignedTasksSection
        tasks={project.unassignedTasks}
        project={project}
        allTasks={allTasks}
        onAddTask={() => {
          onAddTaskInPhase(null);
        }}
        onToggle={onToggle}
        onSelectTask={onSelectTask}
        onDelete={onDelete}
        currentUserId={currentUserId}
      />
    </div>
  );
}

function UnassignedTasksSection({
  tasks,
  project,
  allTasks,
  onAddTask,
  onToggle,
  onSelectTask,
  onDelete,
  currentUserId,
}: {
  tasks: Task[];
  project: Project;
  allTasks: Task[];
  onAddTask: () => void;
  onToggle: (task: Task) => Promise<void>;
  onSelectTask: (task: Task) => void;
  onDelete: (task: Task) => Promise<void>;
  currentUserId?: string;
}) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <SectionTitle count={`${String(tasks.length)} tasks`}>
          <span
            className="mr-2 inline-block size-2 rounded-full align-middle"
            style={{ backgroundColor: phaseColors.pink }}
          />
          Unassigned Tasks
        </SectionTitle>
        <Button variant="ghost" size="sm" onClick={onAddTask}>
          <Plus size={14} />
          Add task
        </Button>
      </div>
      <div className="overflow-hidden rounded-lg border border-[#e2e4ec] bg-white">
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            project={project}
            allTasks={allTasks}
            onToggle={onToggle}
            onSelectTask={onSelectTask}
            onDelete={onDelete}
            currentUserId={currentUserId}
          />
        ))}
        {tasks.length === 0 && (
          <p className="px-4 py-3 text-xs text-[#8b8c9d]">
            No unassigned tasks. Tasks without a phase appear here.
          </p>
        )}
      </div>
    </section>
  );
}
