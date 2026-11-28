import { useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  GripVertical,
  Lock,
  Pause,
  Pencil,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import { TaskStatus, isTaskBlocked, isTaskOutsidePhaseDates } from "@repo/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Phase, Project, Task, UpdatePhasePayload } from "@/lib/planner-types";
import {
  cn,
  phaseColors,
  phaseStatusClasses,
  phaseStatusLabels,
  priorityLabels,
  statusClasses,
  taskStatusLabels,
} from "../view-common";
import { PhaseFormDialog } from "./phase-dialogs";
import { formatProjectDate } from "./project-overview";

export function PhaseGroup({
  phase,
  project,
  allTasks,
  isFirst,
  isLast,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  onMoveUp,
  onMoveDown,
  onAddTask,
  onToggle,
  onSelectTask,
  onDelete,
  onUpdatePhase,
  onDeletePhase,
  currentUserId,
  showDropPlaceholder,
  dropPlaceholderPhase,
}: {
  phase: Phase;
  project: Project;
  allTasks: Task[];
  isFirst: boolean;
  isLast: boolean;
  onDragStart: () => void;
  onDragOver: () => void;
  onDragEnd: () => void;
  onDrop: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddTask: () => void;
  onToggle: (task: Task) => Promise<void>;
  onSelectTask: (task: Task) => void;
  onDelete: (task: Task) => Promise<void>;
  onUpdatePhase: (phaseId: string, input: UpdatePhasePayload) => Promise<void>;
  onDeletePhase: (phaseId: string) => Promise<void>;
  currentUserId?: string;
  showDropPlaceholder: boolean;
  dropPlaceholderPhase?: Phase;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const placeholderPhase = dropPlaceholderPhase ?? phase;

  return (
    <section
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", phase.id);

        const dragPreview = document.createElement("div");
        dragPreview.textContent = `|  ${phase.name}  |  ${phase.tasks.length} tasks  |  ${phase.progress}%`;
        dragPreview.style.position = "fixed";
        dragPreview.style.top = "-1000px";
        dragPreview.style.left = "-1000px";
        dragPreview.style.padding = "6px 10px";
        dragPreview.style.border = "1px solid #e2e4ec";
        dragPreview.style.borderRadius = "6px";
        dragPreview.style.background = "white";
        dragPreview.style.color = "#25263a";
        dragPreview.style.fontSize = "14px";
        dragPreview.style.boxShadow = "0 2px 8px rgba(37, 38, 58, 0.16)";
        document.body.appendChild(dragPreview);
        event.dataTransfer.setDragImage(dragPreview, 10, 10);
        requestAnimationFrame(() => {
          dragPreview.remove();
        });
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver();
      }}
      onDrop={onDrop}
    >
      {showDropPlaceholder && (
        <div className="mb-2 flex min-h-10 items-center gap-2 rounded-lg border border-dashed border-[#7663c8] bg-[#f7f5ff] px-3 text-sm text-[#7663c8] opacity-70">
          <GripVertical size={14} className="mr-2" />
          <span className="size-2 rounded-full bg-[#7663c8]" />
          <span className="font-semibold">{placeholderPhase.name}</span>
          <span className="text-xs">
            {placeholderPhase.tasks.length} tasks · {placeholderPhase.progress}%
          </span>
        </div>
      )}
      <PhaseHeader
        phase={phase}
        isFirst={isFirst}
        isLast={isLast}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onAddTask={onAddTask}
        onToggleHold={() => {
          void onUpdatePhase(phase.id, { isOnHold: !phase.isOnHold });
        }}
        onEdit={() => {
          setEditOpen(true);
        }}
        onDelete={() => {
          setDeleteOpen(true);
        }}
      />
      {phase.description && <p className="mb-2 text-xs text-[#77788a]">{phase.description}</p>}
      <PhaseTaskList
        phase={phase}
        project={project}
        allTasks={allTasks}
        onToggle={onToggle}
        onSelectTask={onSelectTask}
        onDelete={onDelete}
        currentUserId={currentUserId}
      />
      <PhaseDialogs
        phase={phase}
        deleteOpen={deleteOpen}
        editOpen={editOpen}
        setDeleteOpen={setDeleteOpen}
        setEditOpen={setEditOpen}
        onDeletePhase={onDeletePhase}
        onUpdatePhase={onUpdatePhase}
      />
    </section>
  );
}

function PhaseTaskList({
  phase,
  project,
  allTasks,
  onToggle,
  onSelectTask,
  onDelete,
  currentUserId,
}: {
  phase: Phase;
  project: Project;
  allTasks: Task[];
  onToggle: (task: Task) => Promise<void>;
  onSelectTask: (task: Task) => void;
  onDelete: (task: Task) => Promise<void>;
  currentUserId?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#e2e4ec] bg-white">
      {phase.tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          phase={phase}
          project={project}
          allTasks={allTasks}
          onToggle={onToggle}
          onSelectTask={onSelectTask}
          onDelete={onDelete}
          currentUserId={currentUserId}
        />
      ))}
      {phase.tasks.length === 0 && (
        <p className="px-4 py-3 text-xs text-[#8b8c9d]">No tasks in this phase yet.</p>
      )}
    </div>
  );
}

function PhaseDialogs({
  phase,
  deleteOpen,
  editOpen,
  setDeleteOpen,
  setEditOpen,
  onDeletePhase,
  onUpdatePhase,
}: {
  phase: Phase;
  deleteOpen: boolean;
  editOpen: boolean;
  setDeleteOpen: (open: boolean) => void;
  setEditOpen: (open: boolean) => void;
  onDeletePhase: (phaseId: string) => Promise<void>;
  onUpdatePhase: (phaseId: string, input: UpdatePhasePayload) => Promise<void>;
}) {
  return (
    <>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${phase.name}?`}
        description="This phase will be deleted, but its tasks will be preserved as Unassigned Tasks."
        onConfirm={async () => {
          await onDeletePhase(phase.id);
        }}
      />
      {editOpen && (
        <PhaseFormDialog
          title="Edit phase"
          submitLabel="Save changes"
          initialPhase={phase}
          onClose={() => {
            setEditOpen(false);
          }}
          onSubmit={async (input) => {
            await onUpdatePhase(phase.id, input);
          }}
        />
      )}
    </>
  );
}

function PhaseHeader({
  phase,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onAddTask,
  onToggleHold,
  onEdit,
  onDelete,
}: {
  phase: Phase;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddTask: () => void;
  onToggleHold: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const completedCount = phase.tasks.filter((t) => t.status === TaskStatus.Completed).length;
  return (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <GripVertical size={14} className="cursor-grab text-[#8b8c9d]" />
        <span
          className="inline-block size-2 rounded-full"
          style={{ backgroundColor: phaseColors[phase.tone] }}
        />
        <h2 className="text-[15px] font-semibold">{phase.name}</h2>
        <Badge className={cn("font-normal", phaseStatusClasses[phase.status])}>
          {phaseStatusLabels[phase.status]}
        </Badge>
        <span className="text-xs text-[#8b8c9d]">
          {completedCount}/{phase.tasks.length} tasks · {phase.progress}%
        </span>
        {(phase.startDate ?? phase.dueDate) && (
          <span className="text-xs text-[#77788a]">
            ({formatProjectDate(phase.startDate)} – {formatProjectDate(phase.dueDate)})
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Progress value={phase.progress} className="mr-2 hidden h-1.5 w-20 sm:block" />
        <Button variant="ghost" size="icon-sm" onClick={onAddTask} title="Add task to phase">
          <Plus />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleHold}
          title={phase.isOnHold ? "Resume phase" : "Put phase on hold"}
        >
          {phase.isOnHold ? <Play /> : <Pause />}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isFirst}
          onClick={onMoveUp}
          title="Move up"
        >
          <ArrowUp />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isLast}
          onClick={onMoveDown}
          title="Move down"
        >
          <ArrowDown />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onEdit} title="Edit phase">
          <Pencil />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={onDelete} title="Delete phase">
          <Trash2 />
        </Button>
      </div>
    </div>
  );
}

export function TaskRow({
  task,
  phase,
  project,
  allTasks,
  onToggle,
  onSelectTask,
  onDelete,
  currentUserId,
}: {
  task: Task;
  phase?: Phase;
  project: Project;
  allTasks: Task[];
  onToggle: (task: Task) => Promise<void>;
  onSelectTask: (task: Task) => void;
  onDelete: (task: Task) => Promise<void>;
  currentUserId?: string;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const blocked = isTaskBlocked(task, project.dependencies, allTasks);
  const outsideDates = phase ? isTaskOutsidePhaseDates(task, phase) : false;
  const isCompleted = task.status === TaskStatus.Completed;

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[#e5e7ef] px-3 py-3 last:border-0 md:grid-cols-[1fr_auto_88px_62px_72px_auto]">
      <div className="flex min-w-0 items-center gap-3">
        <Checkbox
          checked={isCompleted}
          className={blocked ? "bg-gray-200 opacity-60" : ""}
          disabled={blocked}
          onCheckedChange={() => {
            void onToggle(task);
          }}
        />
        <button
          type="button"
          onClick={() => {
            onSelectTask(task);
          }}
          className={cn(
            "truncate text-left text-sm hover:underline",
            isCompleted && "text-[#858698] line-through",
            task.status === TaskStatus.Cancelled && "text-[#9b9cad] line-through",
          )}
        >
          {task.name}
        </button>
      </div>
      <TaskRowIndicators blocked={blocked} outsideDates={outsideDates} />
      <Badge
        className={cn(
          "hidden justify-center font-normal md:inline-flex",
          statusClasses[task.status],
        )}
      >
        {taskStatusLabels[task.status]}
      </Badge>
      <span className="hidden text-xs text-[#77788a] md:block">
        {priorityLabels[task.priority]}
      </span>
      <span className="hidden text-right text-xs text-[#77788a] md:block">
        {task.dueDate ?? getAssigneeLabel(task.assigneeId, currentUserId)}
      </span>
      <TaskRowActions
        onEdit={() => {
          onSelectTask(task);
        }}
        onDelete={() => {
          setDeleteOpen(true);
        }}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete ${task.name}?`}
        description="This task and its dependencies will be permanently deleted."
        onConfirm={() => onDelete(task)}
      />
    </div>
  );
}

function TaskRowIndicators({ blocked, outsideDates }: { blocked: boolean; outsideDates: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      {blocked && (
        <Badge
          className="bg-[#fbf2df] text-[10px] text-[#a7803d]"
          title="Blocked by incomplete prerequisites"
        >
          <Lock size={10} className="mr-1" />
          Blocked
        </Badge>
      )}
      {outsideDates && (
        <span title="Task dates fall outside phase date range" className="text-[#a7803d]">
          <AlertTriangle size={14} />
        </span>
      )}
    </div>
  );
}

function TaskRowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <span className="flex gap-1">
      <Button variant="ghost" size="icon-sm" onClick={onEdit} title="Task details">
        <Pencil />
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={onDelete} title="Delete task">
        <Trash2 />
      </Button>
    </span>
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              void onConfirm().then(() => {
                onOpenChange(false);
              });
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function getAssigneeLabel(assigneeId: string | null, currentUserId: string | undefined) {
  if (!assigneeId) return "Unassigned";
  if (assigneeId === currentUserId) return "You";
  return "Assigned";
}
