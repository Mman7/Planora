import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import { Priority, TaskStatus, isTaskOutsidePhaseDates, validateDateRange } from "@repo/shared";
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
import type { CreateTaskPayload, Phase, Project } from "@/lib/planner-types";
import { priorityLabels, taskStatusLabels } from "../view-common";

const NO_PHASE_VALUE = "__none__";
const UNASSIGNED_USER = "__unassigned__";

type FormState = {
  projectId: string;
  title: string;
  description: string;
  phaseId: string;
  priority: Priority;
  status: TaskStatus;
  assigneeId: string;
  startDate: string;
  dueDate: string;
  estimatedMinutes: string;
};

function buildPayload(form: FormState): CreateTaskPayload {
  const parsed = form.estimatedMinutes.trim() ? Number(form.estimatedMinutes) : null;
  return {
    title: form.title.trim(),
    description: form.description.trim() || null,
    phaseId: form.phaseId === NO_PHASE_VALUE ? null : form.phaseId,
    priority: form.priority,
    status: form.status,
    assigneeId: form.assigneeId === UNASSIGNED_USER ? null : form.assigneeId,
    startDate: form.startDate || null,
    dueDate: form.dueDate || null,
    estimatedMinutes: parsed !== null && Number.isFinite(parsed) ? parsed : null,
  };
}

function validateCreateForm(form: FormState): string | null {
  if (!form.title.trim() || !form.projectId) {
    return "Title and project are required.";
  }
  const dateValidation = validateDateRange(form.startDate || null, form.dueDate || null);
  return dateValidation.valid ? null : (dateValidation.error ?? "Invalid date range.");
}

function getInitialCreateForm({
  projects,
  defaultProjectId,
  defaultPhaseId,
  currentUserId,
  defaultStatus = TaskStatus.Todo,
}: {
  projects: Project[];
  defaultProjectId: string;
  defaultPhaseId?: string | null;
  currentUserId?: string;
  defaultStatus?: TaskStatus;
}): FormState {
  return {
    projectId: defaultProjectId || (projects[0]?.id ?? ""),
    title: "",
    description: "",
    phaseId: defaultPhaseId ?? NO_PHASE_VALUE,
    priority: Priority.Medium,
    status: defaultStatus,
    assigneeId: currentUserId ?? UNASSIGNED_USER,
    startDate: "",
    dueDate: "",
    estimatedMinutes: "",
  };
}

async function submitCreateTask({
  form,
  onCreate,
  onClose,
  setError,
  setSubmitting,
}: {
  form: FormState;
  onCreate: (projectId: string, input: CreateTaskPayload) => Promise<void>;
  onClose: () => void;
  setError: (message: string | null) => void;
  setSubmitting: (value: boolean) => void;
}) {
  const validationError = validateCreateForm(form);
  if (validationError) {
    setError(validationError);
    return;
  }
  setError(null);
  setSubmitting(true);
  try {
    await onCreate(form.projectId, buildPayload(form));
    onClose();
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to create task");
  } finally {
    setSubmitting(false);
  }
}

function hasOutsidePhaseWarning(
  form: FormState,
  selectedPhase: Project["phases"][number] | undefined,
) {
  return (
    Boolean(selectedPhase) &&
    isTaskOutsidePhaseDates(
      { startDate: form.startDate || null, dueDate: form.dueDate || null },
      selectedPhase ?? { startDate: null, dueDate: null },
    )
  );
}

export function CreateTaskDialog({
  projects,
  defaultProjectId,
  defaultPhaseId,
  defaultStatus = TaskStatus.Todo,
  currentUser,
  onClose,
  onCreate,
}: {
  projects: Project[];
  defaultProjectId: string;
  defaultPhaseId?: string | null;
  defaultStatus?: TaskStatus;
  currentUser: CurrentUser | null;
  onClose: () => void;
  onCreate: (projectId: string, input: CreateTaskPayload) => Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(() =>
    getInitialCreateForm({
      projects,
      defaultProjectId,
      defaultPhaseId,
      currentUserId: currentUser?.id,
      defaultStatus,
    }),
  );
  const [showScheduling, setShowScheduling] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phases = projects.find((item) => item.id === form.projectId)?.phases ?? [];
  const selectedPhase = phases.find((item) => item.id === form.phaseId);
  const outsidePhaseWarning = hasOutsidePhaseWarning(form, selectedPhase);

  const patchForm = (patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create task</DialogTitle>
          <DialogDescription>
            Add a task quickly with just a title and project, or expand scheduling details.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <CreateTaskBasicFields
            form={form}
            projects={projects}
            phases={phases}
            currentUser={currentUser}
            onPatch={patchForm}
          />
          <CreateTaskSchedulingSection
            form={form}
            showScheduling={showScheduling}
            outsidePhaseWarning={outsidePhaseWarning}
            onToggle={() => {
              setShowScheduling((prev) => !prev);
            }}
            onPatch={patchForm}
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <CreateTaskFooter
          disabled={!form.title.trim() || !form.projectId || submitting}
          submitting={submitting}
          onClose={onClose}
          onSubmit={() => {
            void submitCreateTask({ form, onCreate, onClose, setError, setSubmitting });
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function CreateTaskFooter({
  disabled,
  submitting,
  onClose,
  onSubmit,
}: {
  disabled: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <DialogFooter>
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button disabled={disabled} onClick={onSubmit}>
        {submitting ? "Creating..." : "Create task"}
      </Button>
    </DialogFooter>
  );
}

function CreateTaskBasicFields({
  form,
  projects,
  phases,
  currentUser,
  onPatch,
}: {
  form: FormState;
  projects: Project[];
  phases: Phase[];
  currentUser: CurrentUser | null;
  onPatch: (patch: Partial<FormState>) => void;
}) {
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#77788a]">
        Basic Information
      </p>
      <label className="block text-sm font-medium">
        Title *
        <Input
          autoFocus
          value={form.title}
          onChange={(event) => {
            onPatch({ title: event.target.value });
          }}
          placeholder="e.g. Prepare launch checklist"
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
          placeholder="Optional details..."
          className="mt-1.5 min-h-16"
        />
      </label>
      <CreateTaskProjectPhaseRow
        form={form}
        projects={projects}
        phases={phases}
        onPatch={onPatch}
      />
      <CreateTaskMetaRow form={form} currentUser={currentUser} onPatch={onPatch} />
    </>
  );
}

function CreateTaskProjectPhaseRow({
  form,
  projects,
  phases,
  onPatch,
}: {
  form: FormState;
  projects: Project[];
  phases: Phase[];
  onPatch: (patch: Partial<FormState>) => void;
}) {
  const selectedProjectName = projects.find((project) => project.id === form.projectId)?.name;
  const selectedPhaseName = phases.find((phase) => phase.id === form.phaseId)?.name;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block text-sm font-medium">
        Project *
        <Select
          value={form.projectId}
          onValueChange={(value) => {
            onPatch({ projectId: value ?? "", phaseId: NO_PHASE_VALUE });
          }}
        >
          <SelectTrigger className="mt-1.5 w-full">
            <SelectValue>{selectedProjectName ?? "Select project"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {projects.map((proj) => (
              <SelectItem key={proj.id} value={proj.id}>
                {proj.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      <label className="block text-sm font-medium">
        Phase (optional)
        <Select
          value={form.phaseId}
          onValueChange={(value) => {
            onPatch({ phaseId: value ?? NO_PHASE_VALUE });
          }}
        >
          <SelectTrigger className="mt-1.5 w-full">
            <SelectValue>{selectedPhaseName ?? "Unassigned"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_PHASE_VALUE}>Unassigned</SelectItem>
            {phases.map((phase) => (
              <SelectItem key={phase.id} value={phase.id}>
                {phase.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
    </div>
  );
}

function CreateTaskMetaRow({
  form,
  currentUser,
  onPatch,
}: {
  form: FormState;
  currentUser: CurrentUser | null;
  onPatch: (patch: Partial<FormState>) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <label className="block text-sm font-medium">
        Priority
        <Select
          value={form.priority}
          onValueChange={(value) => {
            if (value) onPatch({ priority: value });
          }}
        >
          <SelectTrigger className="mt-1.5 w-full">
            <SelectValue />
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
      <label className="block text-sm font-medium">
        Status
        <Select
          value={form.status}
          onValueChange={(value) => {
            if (value) onPatch({ status: value });
          }}
        >
          <SelectTrigger className="mt-1.5 w-full">
            <SelectValue />
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
        Assignee
        <Select
          value={form.assigneeId}
          onValueChange={(value) => {
            onPatch({ assigneeId: value ?? UNASSIGNED_USER });
          }}
        >
          <SelectTrigger className="mt-1.5 w-full">
            <SelectValue>
              {currentUser?.id === form.assigneeId ? `Myself (${currentUser.name})` : "Unassigned"}
            </SelectValue>
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

function CreateTaskSchedulingSection({
  form,
  showScheduling,
  outsidePhaseWarning,
  onToggle,
  onPatch,
}: {
  form: FormState;
  showScheduling: boolean;
  outsidePhaseWarning: boolean;
  onToggle: () => void;
  onPatch: (patch: Partial<FormState>) => void;
}) {
  return (
    <div className="border-t border-[#e5e7ef] pt-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#77788a] hover:text-[#25243a]"
      >
        {showScheduling ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        Scheduling (optional)
      </button>
      {showScheduling && (
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
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
              placeholder="e.g. 60"
              className="mt-1.5"
            />
          </label>
        </div>
      )}
      {outsidePhaseWarning && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-[#a7803d]">
          <AlertTriangle size={14} />
          Task dates fall outside the selected phase date range.
        </p>
      )}
    </div>
  );
}
