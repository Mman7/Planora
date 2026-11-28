"use client";

import {
  REMINDER_OPTIONS,
  useSettingsStore,
  WEEKDAY_LABELS,
  type SettingsSection,
} from "@/lib/settings";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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

export function NotificationSettingsSection({ registerRef }: SectionProps) {
  const draft = useSettingsStore((s) => s.draft);
  const updateDraft = useSettingsStore((s) => s.updateDraft);

  if (!draft) return null;

  const notif = draft.notifications;

  const toggleReminder = (value: number) => {
    const current = new Set(notif.reminderDaysBefore);
    if (current.has(value)) {
      current.delete(value);
    } else {
      current.add(value);
    }
    updateDraft("notifications", { reminderDaysBefore: Array.from(current).sort() });
  };

  return (
    <SettingsGroup id="notifications" title="Notifications" registerRef={registerRef}>
      <SettingRow label="Due date reminders">
        <Switch
          checked={notif.dueDateRemindersEnabled}
          onCheckedChange={(v) => {
            updateDraft("notifications", { dueDateRemindersEnabled: v });
          }}
          aria-label="Enable due date reminders"
        />
      </SettingRow>
      {notif.dueDateRemindersEnabled && (
        <div className="border-b border-[#e5e7ef] px-4 py-3">
          <p className="mb-2 text-xs font-medium text-[#77788a]">Remind me</p>
          <div className="flex flex-wrap gap-3">
            {REMINDER_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-xs">
                <Checkbox
                  checked={notif.reminderDaysBefore.includes(opt.value)}
                  onCheckedChange={() => {
                    toggleReminder(opt.value);
                  }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      )}
      <SettingRow label="Weekly summary">
        <Switch
          checked={notif.weeklySummaryEnabled}
          onCheckedChange={(v) => {
            updateDraft("notifications", { weeklySummaryEnabled: v });
          }}
          aria-label="Enable weekly summary"
        />
      </SettingRow>
      {notif.weeklySummaryEnabled && (
        <>
          <SettingRow label="Summary day">
            <Select
              value={String(notif.weeklySummaryDay)}
              onValueChange={(val) => {
                updateDraft("notifications", { weeklySummaryDay: Number(val) });
              }}
            >
              <SelectTrigger aria-label="Summary day">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEEKDAY_LABELS.map((day, i) => (
                  <SelectItem key={day} value={String(i)}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>
          <SettingRow label="Summary time" htmlFor="settings-summary-time">
            <Input
              id="settings-summary-time"
              type="time"
              value={notif.weeklySummaryTime}
              onChange={(e) => {
                updateDraft("notifications", { weeklySummaryTime: e.target.value });
              }}
              className="w-28"
            />
          </SettingRow>
        </>
      )}
      <SettingRow label="In-app notifications">
        <Switch
          checked={notif.inAppEnabled}
          onCheckedChange={(v) => {
            updateDraft("notifications", { inAppEnabled: v });
          }}
          aria-label="Enable in-app notifications"
        />
      </SettingRow>
      <SettingRow label="Email notifications" description="Coming soon">
        <Switch checked={false} disabled aria-label="Email notifications (coming soon)" />
      </SettingRow>
    </SettingsGroup>
  );
}
