import { useState } from "react";
import { AlertTriangle, Lock, Plus, X } from "lucide-react";
import {
  Priority,
  TaskStatus,
  getBlockingTaskIds,
  isTaskBlocked,
  isTaskOutsidePhaseDates,
  validateDateRange,
  validateTaskDependency,
} from "@repo/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CurrentUser } from "@/lib/auth";
import {
  getAllProjectTasks,
  type Project,
  type Task,
  type UpdateTaskPayload,
} from "@/lib/planner-types";
import { priorityLabels, taskStatusLabels } from "../view-common";

const NO_PHASE_VALUE = "__none__";
const UNASSIGNED_USER = "__unassigned__";

type DetailsFormState = {
  title: string;
  description: string;
  phaseId: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string;
  startDate: string;
  dueDate: string;
  estimatedMinutes: string;
};

function buildUpdatePayload(form: DetailsFormState): UpdateTaskPayload {
  const parsedMin = form.estimatedMinutes.trim() ? Number(form.estimatedMinutes) : null;
  return {
    title: form.title.trim(),
    description: form.description.trim() || null,
    phaseId: form.phaseId === NO_PHASE_VALUE ? null : form.phaseId,
    status: form.status,
    priority: form.priority,
    assigneeId: form.assigneeId === UNASSIGNED_USER ? null : form.assigneeId,
    startDate: form.startDate || null,
    dueDate: form.dueDate || null,
    estimatedMinutes: parsedMin !== null && Number.isFinite(parsedMin) ? parsedMin : null,
  };
}

function validateDetailsForm(form: DetailsFormState): string | null {
  if (!form.title.trim()) {
    return "Title is required.";
  }
  const dateCheck = validateDateRange(form.startDate || null, form.dueDate || null);
  return dateCheck.valid ? null : (dateCheck.error ?? "Invalid dates.");
}

function getInitialDetailsForm(task: Task): DetailsFormState {
  return {
    title: task.name,
    description: task.description ?? "",
    phaseId: task.phaseId ?? NO_PHASE_VALUE,
    status: task.status,
    priority: task.priority,
    assigneeId: task.assigneeId ?? UNASSIGNED_USER,
    startDate: task.startDate ?? "",
    dueDate: task.dueDate ?? "",
    estimatedMinutes: task.estimatedMinutes !== null ? String(task.estimatedMinutes) : "",
  };
}

export function TaskDetailsDialog({
  task,
  project,
  currentUser,
  onClose,
  onSave,
  onAddDependency,
  onRemoveDependency,
}: {
  task: Task;
  project: Project;
  currentUser: CurrentUser | null;
  onClose: () => void;
  onSave: (task: Task, input: UpdateTaskPayload) => Promise<void>;
  onAddDependency: (taskId: string, dependsOnTaskId: string) => Promise<void>;
  onRemoveDependency: (taskId: string, dependsOnTaskId: string) => Promise<void>;
}) {
  const [form, setForm] = useState<DetailsFormState>(() => getInitialDetailsForm(task));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const allTasks = getAllProjectTasks(project);
  const blocked = isTaskBlocked(task, project.dependencies, allTasks);
  const currentPhase = project.phases.find((phase) => phase.id === form.phaseId);
  const outsidePhaseWarning =
    Boolean(currentPhase) &&
    isTaskOutsidePhaseDates(
      { startDate: form.startDate || null, dueDate: form.dueDate || null },
      currentPhase ?? { startDate: null, dueDate: null },
    );

  const patchForm = (patch: Partial<DetailsFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = async () => {
    const validationError = validateDetailsForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSave(task, buildUpdatePayload(form));
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <TaskDetailsHeader project={project} task={task} blocked={blocked} />
        <div className="space-y-4">
          <TaskDetailsFields
            form={form}
            project={project}
            currentUser={currentUser}
            outsidePhaseWarning={outsidePhaseWarning}
            onPatch={patchForm}
          />
          <TaskDependenciesSection
            task={task}
            project={project}
            allTasks={allTasks}
            onAddDependency={onAddDependency}
            onRemoveDependency={onRemoveDependency}
            onError={setError}
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!form.title.trim() || saving}
            onClick={() => {
              void handleSave();
            }}
          >
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TaskDetailsHeader({
  project,
  task,
  blocked,
}: {
  project: Project;
  task: Task;
  blocked: boolean;
}) {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        Task Details
        {blocked && (
          <Badge className="bg-[#fbf2df] text-[#a7803d]">
            <Lock size={12} className="mr-1" />
            Blocked
          </Badge>
        )}
      </DialogTitle>
      <DialogDescription>
        Project: {project.name}
        {task.completedAt ? ` · Completed ${new Date(task.completedAt).toLocaleString()}` : ""}
      </DialogDescription>
    </DialogHeader>
  );
}

function TaskDetailsFields({
  form,
  project,
  currentUser,
  outsidePhaseWarning,
  onPatch,
}: {
  form: DetailsFormState;
  project: Project;
  currentUser: CurrentUser | null;
  outsidePhaseWarning: boolean;
  onPatch: (patch: Partial<DetailsFormState>) => void;
}) {
  return (
    <>
      <label className="block text-sm font-medium">
        Title
        <Input
          value={form.title}
          onChange={(event) => {
            onPatch({ title: event.target.value });
          }}
          className="mt-1.5"
        />
      </label>
      <label className="block text-sm font-medium">
        Description
        <Textarea
          value={form.description}
          onChange={(event) => {
            onPatch({ description: event.target.value });
          }}
          className="mt-1.5 min-h-20"
        />
      </label>
      <TaskStatusPriorityRow form={form} onPatch={onPatch} />
      <TaskPhaseAssigneeRow
        form={form}
        project={project}
        currentUser={currentUser}
        onPatch={onPatch}
      />
      <TaskDateRow form={form} outsidePhaseWarning={outsidePhaseWarning} onPatch={onPatch} />
    </>
  );
}

function TaskStatusPriorityRow({
  form,
  onPatch,
}: {
  form: DetailsFormState;
  onPatch: (patch: Partial<DetailsFormState>) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block text-sm font-medium">
        Status
        <Select
          value={form.status}
          onValueChange={(value) => {
            if (value) onPatch({ status: value });
          }}
        >
          <SelectTrigger className="mt-1.5 w-full">
            <SelectValue>{taskStatusLabels[form.status]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.values(TaskStatus).map((item) => (
              <SelectItem key={item} value={item}>
                {taskStatusLabels[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      <label className="block text-sm font-medium">
        Priority
        <Select
          value={form.priority}
          onValueChange={(value) => {
            if (value) onPatch({ priority: value });
          }}
        >
          <SelectTrigger className="mt-1.5 w-full">
            <SelectValue>{priorityLabels[form.priority]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.values(Priority).map((item) => (
              <SelectItem key={item} value={item}>
                {priorityLabels[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
    </div>
  );
}

function TaskPhaseAssigneeRow({
  form,
  project,
  currentUser,
  onPatch,
}: {
  form: DetailsFormState;
  project: Project;
  currentUser: CurrentUser | null;
  onPatch: (patch: Partial<DetailsFormState>) => void;
}) {
  const selectedPhase = project.phases.find((phase) => phase.id === form.phaseId);
  const selectedAssignee = currentUser?.id === form.assigneeId ? currentUser.name : null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block text-sm font-medium">
        Phase
        <Select
          value={form.phaseId}
          onValueChange={(value) => {
            onPatch({ phaseId: value ?? NO_PHASE_VALUE });
          }}
        >
          <SelectTrigger className="mt-1.5 w-full">
            <SelectValue>{selectedPhase?.name ?? "Unassigned"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_PHASE_VALUE}>Unassigned</SelectItem>
            {project.phases.map((phase) => (
              <SelectItem key={phase.id} value={phase.id}>
                {phase.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      <label className="block text-sm font-medium">
        Assignee
        <Select
          value={form.assigneeId}
          onValueChange={(value) => {
            onPatch({ assigneeId: value ?? UNASSIGNED_USER });
          }}
        >
          <SelectTrigger className="mt-1.5 w-full">
            <SelectValue>{selectedAssignee ?? "Unassigned"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UNASSIGNED_USER}>Unassigned</SelectItem>
            {currentUser && (
              <SelectItem value={currentUser.id}>Myself ({currentUser.name})</SelectItem>
            )}
          </SelectContent>
        </Select>
      </label>
    </div>
  );
}

function TaskDateRow({
  form,
  outsidePhaseWarning,
  onPatch,
}: {
  form: DetailsFormState;
  outsidePhaseWarning: boolean;
  onPatch: (patch: Partial<DetailsFormState>) => void;
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-xs font-medium text-[#5f6075]">
          Start date
          <DatePicker
            value={form.startDate}
            onChange={(value) => {
              onPatch({ startDate: value });
            }}
          />
        </label>
        <label className="block text-xs font-medium text-[#5f6075]">
          Due date
          <DatePicker
            value={form.dueDate}
            onChange={(value) => {
              onPatch({ dueDate: value });
            }}
          />
        </label>
        <label className="block text-xs font-medium text-[#5f6075]">
          Est. minutes
          <Input
            type="number"
            min={0}
            value={form.estimatedMinutes}
            onChange={(event) => {
              onPatch({ estimatedMinutes: event.target.value });
            }}
            className="mt-1.5"
          />
        </label>
      </div>
      {outsidePhaseWarning && (
        <p className="flex items-center gap-1.5 text-xs text-[#a7803d]">
          <AlertTriangle size={14} />
          Task dates fall outside its phase date range.
        </p>
      )}
    </>
  );
}

function TaskDependenciesSection({
  task,
  project,
  allTasks,
  onAddDependency,
  onRemoveDependency,
  onError,
}: {
  task: Task;
  project: Project;
  allTasks: Task[];
  onAddDependency: (taskId: string, dependsOnTaskId: string) => Promise<void>;
  onRemoveDependency: (taskId: string, dependsOnTaskId: string) => Promise<void>;
  onError: (msg: string | null) => void;
}) {
  const [newDepId, setNewDepId] = useState("");
  const blockingIds = new Set(getBlockingTaskIds(task.id, project.dependencies, allTasks));
  const taskDeps = project.dependencies.filter((dep) => dep.taskId === task.id);
  const candidatePrereqs = allTasks.filter((item) => item.id !== task.id);

  const handleAddDep = async () => {
    if (!newDepId) return;
    const validation = validateTaskDependency({
      taskId: task.id,
      dependsOnTaskId: newDepId,
      tasks: allTasks,
      existingDependencies: project.dependencies,
    });
    if (!validation.valid) {
      onError(validation.message ?? "Invalid dependency");
      return;
    }
    onError(null);
    try {
      await onAddDependency(task.id, newDepId);
      setNewDepId("");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to add dependency");
    }
  };

  return (
    <div className="border-t border-[#e5e7ef] pt-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#77788a]">
        Dependencies (Prerequisites)
      </p>
      <div className="space-y-1.5">
        {taskDeps.map((dep) => {
          const prereq = allTasks.find((item) => item.id === dep.dependsOnTaskId);
          if (!prereq) return null;
          return (
            <DependencyItem
              key={dep.id}
              name={prereq.name}
              isBlocking={blockingIds.has(prereq.id)}
              onRemove={() => {
                void onRemoveDependency(task.id, prereq.id);
              }}
            />
          );
        })}
        {taskDeps.length === 0 && <p className="text-xs text-[#8b8c9d]">No prerequisites.</p>}
      </div>
      <div className="mt-2 flex gap-2">
        <Select
          value={newDepId}
          onValueChange={(value) => {
            setNewDepId(value ?? "");
          }}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Add prerequisite task..." />
          </SelectTrigger>
          <SelectContent>
            {candidatePrereqs.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          disabled={!newDepId}
          onClick={() => {
            void handleAddDep();
          }}
        >
          <Plus size={14} />
          Add
        </Button>
      </div>
    </div>
  );
}

function DependencyItem({
  name,
  isBlocking,
  onRemove,
}: {
  name: string;
  isBlocking: boolean;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded border border-[#e5e7ef] px-2.5 py-1.5 text-xs">
      <span className="flex items-center gap-2">
        {name}
        {isBlocking && (
          <Badge className="bg-[#fbf2df] text-[10px] text-[#a7803d]">Incomplete</Badge>
        )}
      </span>
      <Button variant="ghost" size="icon-sm" onClick={onRemove} title="Remove dependency">
        <X size={13} />
      </Button>
    </div>
  );
}
