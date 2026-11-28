"use client";

import { useSettingsStore } from "@/lib/settings";
import type { SettingsSection } from "@/lib/settings";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COMMON_TIMEZONES } from "@/lib/settings/timezones";
import { SettingsGroup, SettingRow } from "../settings-view";

type SectionProps = {
  registerRef: (id: SettingsSection, el: HTMLElement | null) => void;
};

export function CalendarSettingsSection({ registerRef }: SectionProps) {
  const draft = useSettingsStore((s) => s.draft);
  const updateDraft = useSettingsStore((s) => s.updateDraft);

  if (!draft) return null;

  const cal = draft.calendar;

  return (
    <SettingsGroup id="calendar" title="Calendar" registerRef={registerRef}>
      <SettingRow label="Timezone">
        <Select
          value={cal.timezone}
          onValueChange={(val) => updateDraft("calendar", { timezone: val })}
        >
          <SelectTrigger className="max-w-56" aria-label="Timezone">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COMMON_TIMEZONES.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingRow>
      <SettingRow label="Start of week">
        <Select
          value={cal.startOfWeek}
          onValueChange={(val) =>
            updateDraft("calendar", {
              startOfWeek: val as "MONDAY" | "SUNDAY" | "SATURDAY",
            })
          }
        >
          <SelectTrigger aria-label="Start of week">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MONDAY">Monday</SelectItem>
            <SelectItem value="SUNDAY">Sunday</SelectItem>
            <SelectItem value="SATURDAY">Saturday</SelectItem>
          </SelectContent>
        </Select>
      </SettingRow>
      <SettingRow label="Default view">
        <Select
          value={cal.defaultView}
          onValueChange={(val) =>
            updateDraft("calendar", {
              defaultView: val as "MONTH" | "WEEK" | "DAY",
            })
          }
        >
          <SelectTrigger aria-label="Default calendar view">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MONTH">Month</SelectItem>
            <SelectItem value="WEEK">Week</SelectItem>
            <SelectItem value="DAY">Day</SelectItem>
          </SelectContent>
        </Select>
      </SettingRow>
      <SettingRow label="Show completed tasks">
        <Switch
          checked={cal.showCompletedTasks}
          onCheckedChange={(v) => updateDraft("calendar", { showCompletedTasks: v })}
          aria-label="Show completed tasks"
        />
      </SettingRow>
      <SettingRow label="Show weekends">
        <Switch
          checked={cal.showWeekends}
          onCheckedChange={(v) => updateDraft("calendar", { showWeekends: v })}
          aria-label="Show weekends"
        />
      </SettingRow>
      <SettingRow label="Show milestones">
        <Switch
          checked={cal.showMilestones}
          onCheckedChange={(v) => updateDraft("calendar", { showMilestones: v })}
          aria-label="Show milestones"
        />
      </SettingRow>
      <SettingRow label="Show task start dates">
        <Switch
          checked={cal.showTaskStartDates}
          onCheckedChange={(v) => updateDraft("calendar", { showTaskStartDates: v })}
          aria-label="Show task start dates"
        />
      </SettingRow>
      <SettingRow label="Show task due dates">
        <Switch
          checked={cal.showTaskDueDates}
          onCheckedChange={(v) => updateDraft("calendar", { showTaskDueDates: v })}
          aria-label="Show task due dates"
        />
      </SettingRow>
    </SettingsGroup>
  );
}
