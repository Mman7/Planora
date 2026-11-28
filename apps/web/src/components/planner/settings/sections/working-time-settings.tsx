"use client";

import { useSettingsStore, WEEKDAY_LABELS, type SettingsSection } from "@/lib/settings";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { SettingsGroup, SettingRow } from "../settings-view";

type SectionProps = {
  registerRef: (id: SettingsSection, el: HTMLElement | null) => void;
};

export function WorkingTimeSettingsSection({ registerRef }: SectionProps) {
  const draft = useSettingsStore((s) => s.draft);
  const updateDraft = useSettingsStore((s) => s.updateDraft);

  if (!draft) return null;

  const { workingDays, startTime, endTime, breakEnabled, breakStart, breakEnd } = draft.workingTime;

  const toggleDay = (dayIndex: number) => {
    const current = new Set(workingDays);
    if (current.has(dayIndex)) {
      if (current.size <= 1) return;
      current.delete(dayIndex);
    } else {
      current.add(dayIndex);
    }
    updateDraft("workingTime", { workingDays: Array.from(current).sort() });
  };

  const summary = buildWorkingTimeSummary({
    workingDays,
    startTime,
    endTime,
    breakEnabled,
    breakStart,
    breakEnd,
  });

  return (
    <SettingsGroup id="working-time" title="Working time" registerRef={registerRef}>
      <SettingRow label="Working days">
        <div className="flex gap-1" role="group" aria-label="Working days">
          {WEEKDAY_LABELS.map((day, index) => (
            <button
              key={day}
              type="button"
              onClick={() => {
                toggleDay(index);
              }}
              aria-pressed={workingDays.includes(index)}
              className={cn(
                "flex h-7 w-9 items-center justify-center rounded-md text-xs font-medium transition-colors",
                workingDays.includes(index)
                  ? "bg-[#7663c8] text-white"
                  : "bg-[#f0f2f7] text-[#77788a] hover:bg-[#e5e7ef]",
              )}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </SettingRow>
      <SettingRow label="Start time" htmlFor="settings-start-time">
        <Input
          id="settings-start-time"
          type="time"
          value={startTime}
          onChange={(e) => {
            updateDraft("workingTime", { startTime: e.target.value });
          }}
          className="w-28"
        />
      </SettingRow>
      <SettingRow label="End time" htmlFor="settings-end-time">
        <Input
          id="settings-end-time"
          type="time"
          value={endTime}
          onChange={(e) => {
            updateDraft("workingTime", { endTime: e.target.value });
          }}
          className="w-28"
        />
      </SettingRow>
      <SettingRow label="Break time" htmlFor="settings-break-toggle">
        <Switch
          id="settings-break-toggle"
          checked={breakEnabled}
          onCheckedChange={(checked) => {
            updateDraft("workingTime", {
              breakEnabled: checked,
              breakStart: checked ? (breakStart ?? "12:00") : null,
              breakEnd: checked ? (breakEnd ?? "13:00") : null,
            });
          }}
          aria-label="Enable break time"
        />
      </SettingRow>
      {breakEnabled && (
        <>
          <SettingRow label="Break start" htmlFor="settings-break-start">
            <Input
              id="settings-break-start"
              type="time"
              value={breakStart ?? "12:00"}
              onChange={(e) => {
                updateDraft("workingTime", { breakStart: e.target.value });
              }}
              className="w-28"
            />
          </SettingRow>
          <SettingRow label="Break end" htmlFor="settings-break-end">
            <Input
              id="settings-break-end"
              type="time"
              value={breakEnd ?? "13:00"}
              onChange={(e) => {
                updateDraft("workingTime", { breakEnd: e.target.value });
              }}
              className="w-28"
            />
          </SettingRow>
        </>
      )}
      <div className="border-t border-[#e5e7ef] px-4 py-3">
        <p className="text-xs text-[#77788a]">{summary}</p>
      </div>
    </SettingsGroup>
  );
}

function buildWorkingTimeSummary({
  workingDays,
  startTime,
  endTime,
  breakEnabled,
  breakStart,
  breakEnd,
}: {
  workingDays: number[];
  startTime: string;
  endTime: string;
  breakEnabled: boolean;
  breakStart: string | null;
  breakEnd: string | null;
}): string {
  const sorted = [...workingDays].sort();
  const dayNames = sorted.map((d) => WEEKDAY_LABELS[d]);

  let daysStr: string;
  if (sorted.length === 7) {
    daysStr = "Every day";
  } else if (sorted.length === 5 && sorted[0] === 0 && sorted[4] === 4) {
    daysStr = "Monday – Friday";
  } else {
    daysStr = dayNames.join(", ");
  }

  let result = `${daysStr} · ${startTime} – ${endTime}`;

  if (breakEnabled && breakStart && breakEnd) {
    result += ` · Break ${breakStart} – ${breakEnd}`;
  }

  return result;
}
