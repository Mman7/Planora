import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import type { Project } from "@/lib/planner-types";

export function ProjectSettings({
  project,
  onSave,
}: {
  project: Project;
  onSave: (name: string, description: string, dueDate: string | null) => Promise<void>;
}) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [dueDate, setDueDate] = useState(project.dueDate ?? "");
  return (
    <div className="max-w-2xl space-y-4 rounded-lg border border-[#e2e4ec] bg-white p-5">
      <div className="mb-5">
        <h2 className="text-base font-semibold">Project settings</h2>
        <p className="mt-1 text-sm text-[#77788a]">
          Update the project name, description, and target date.
        </p>
      </div>
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
      <label className="block text-sm font-medium">
        Target date
        <DatePicker value={dueDate} onChange={setDueDate} />
      </label>
      <Button
        className="mt-5"
        disabled={!name.trim()}
        onClick={() => {
          void onSave(name.trim(), description, dueDate || null);
        }}
      >
        Save changes
      </Button>
    </div>
  );
}
