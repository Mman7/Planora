"use client";

import { useSettingsStore } from "@/lib/settings";
import type { SettingsSection } from "@/lib/settings";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsGroup, SettingRow } from "../settings-view";

type SectionProps = {
  registerRef: (id: SettingsSection, el: HTMLElement | null) => void;
};

export function WorkspaceSettingsSection({ registerRef }: SectionProps) {
  const draft = useSettingsStore((s) => s.draft);
  const updateDraft = useSettingsStore((s) => s.updateDraft);

  if (!draft) return null;

  return (
    <SettingsGroup id="workspace" title="Workspace" registerRef={registerRef}>
      <SettingRow label="Name" htmlFor="settings-workspace-name">
        <Input
          id="settings-workspace-name"
          value={draft.workspace.name}
          onChange={(e) => updateDraft("workspace", { name: e.target.value })}
          className="max-w-60"
          maxLength={100}
          required
        />
      </SettingRow>
      <SettingRow label="Description" htmlFor="settings-workspace-desc">
        <Textarea
          id="settings-workspace-desc"
          value={draft.workspace.description ?? ""}
          onChange={(e) =>
            updateDraft("workspace", {
              description: e.target.value || null,
            })
          }
          className="max-w-60 min-h-8"
          maxLength={500}
          rows={1}
          placeholder="Optional workspace description"
        />
      </SettingRow>
      <SettingRow label="Default project view">
        <Select
          value={draft.workspace.defaultProjectView}
          onValueChange={(val) =>
            updateDraft("workspace", {
              defaultProjectView: val as "GRID" | "LIST",
            })
          }
        >
          <SelectTrigger aria-label="Default project view">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GRID">Grid</SelectItem>
            <SelectItem value="LIST">List</SelectItem>
          </SelectContent>
        </Select>
      </SettingRow>
      <SettingRow label="Default task view">
        <Select
          value={draft.workspace.defaultTaskView}
          onValueChange={(val) =>
            updateDraft("workspace", {
              defaultTaskView: val as "LIST" | "BOARD",
            })
          }
        >
          <SelectTrigger aria-label="Default task view">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LIST">List</SelectItem>
            <SelectItem value="BOARD">Board</SelectItem>
          </SelectContent>
        </Select>
      </SettingRow>
    </SettingsGroup>
  );
}
