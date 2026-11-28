import { useState } from "react";
import { validatePhaseDateRange } from "@repo/shared";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CreatePhasePayload, Phase } from "@/lib/planner-types";

function validatePhaseForm(name: string, startDate: string, dueDate: string): string | null {
  if (!name.trim()) {
    return "Phase name is required.";
  }
  const dateCheck = validatePhaseDateRange(startDate || null, dueDate || null);
  return dateCheck.valid ? null : (dateCheck.error ?? "Invalid phase date range.");
}

function getInitialPhaseValues(initialPhase?: Phase) {
  return {
    name: initialPhase?.name ?? "",
    description: initialPhase?.description ?? "",
    startDate: initialPhase?.startDate ?? "",
    dueDate: initialPhase?.dueDate ?? "",
  };
}

export function PhaseFormDialog({
  title,
  submitLabel,
  initialPhase,
  onClose,
  onSubmit,
}: {
  title: string;
  submitLabel: string;
  initialPhase?: Phase;
  onClose: () => void;
  onSubmit: (input: CreatePhasePayload) => Promise<void>;
}) {
  const initial = getInitialPhaseValues(initialPhase);
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [startDate, setStartDate] = useState(initial.startDate);
  const [dueDate, setDueDate] = useState(initial.dueDate);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const validationError = validatePhaseForm(name, startDate, dueDate);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || null,
        startDate: startDate || null,
        dueDate: dueDate || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save phase");
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <PhaseFormFields
          name={name}
          description={description}
          startDate={startDate}
          dueDate={dueDate}
          error={error}
          onNameChange={setName}
          onDescriptionChange={setDescription}
          onStartDateChange={setStartDate}
          onDueDateChange={setDueDate}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!name.trim() || saving}
            onClick={() => {
              void handleSave();
            }}
          >
            {saving ? "Saving..." : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PhaseFormFields({
  name,
  description,
  startDate,
  dueDate,
  error,
  onNameChange,
  onDescriptionChange,
  onStartDateChange,
  onDueDateChange,
}: {
  name: string;
  description: string;
  startDate: string;
  dueDate: string;
  error: string | null;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">
        Phase name *
        <Input
          autoFocus
          value={name}
          onChange={(event) => {
            onNameChange(event.target.value);
          }}
          placeholder="e.g. Development"
          className="mt-1.5"
        />
      </label>
      <label className="block text-sm font-medium">
        Description
        <Textarea
          value={description}
          onChange={(event) => {
            onDescriptionChange(event.target.value);
          }}
          placeholder="Optional stage description..."
          className="mt-1.5 min-h-16"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-medium text-[#5f6075]">
          Start date
          <DatePicker value={startDate} onChange={onStartDateChange} />
        </label>
        <label className="block text-xs font-medium text-[#5f6075]">
          Due date
          <DatePicker value={dueDate} onChange={onDueDateChange} />
        </label>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
