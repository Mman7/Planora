"use client";

import { useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, PageHeader } from "./view-common";

export function SettingsView() {
  const [saved, setSaved] = useState(false);
  const [weekly, setWeekly] = useState(false);
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your profile, workspace and preferences."
        action={
          <Button
            onClick={() => {
              setSaved(true);
            }}
          >
            {saved && <Check />}
            {saved ? "Changes saved" : "Save changes"}
          </Button>
        }
      />
      <div className="grid gap-6 md:grid-cols-[150px_1fr]">
        <nav className="space-y-2 text-sm text-[#77788a]">
          {[
            "Profile",
            "Workspace",
            "Working time",
            "Calendar",
            "AI provider",
            "Notifications",
            "Account",
          ].map((item, index) => (
            <button
              key={item}
              className={cn(
                "block w-full rounded-md px-3 py-2 text-left",
                index === 0 && "bg-[#f0edfa] font-medium text-[#7663c8]",
              )}
            >
              {item}
            </button>
          ))}
        </nav>
        <div className="space-y-4">
          <SettingsGroup title="Profile">
            <SettingRow label="Name" value="Aisha Musa" />
            <SettingRow label="Email" value="aisha@example.com" />
          </SettingsGroup>
          <SettingsGroup title="Working time">
            <SettingRow label="Working days" value="Mon - Fri" />
            <SettingRow label="Working hours" value="9:00 - 17:00" />
          </SettingsGroup>
          <SettingsGroup title="AI provider">
            <SettingRow label="Provider" value="Claude" />
            <SettingRow label="API key" value="Connected" />
          </SettingsGroup>
          <SettingsGroup title="Notifications">
            <SettingRow label="Due date reminders" value="On" />
            <div className="flex items-center justify-between border-t border-[#e5e7ef] px-3 py-3 text-sm">
              <span>Weekly summary</span>
              <button
                onClick={() => {
                  setWeekly(!weekly);
                }}
                className={cn(
                  "relative h-5 w-9 rounded-full transition-colors",
                  weekly ? "bg-[#7663c8]" : "bg-[#dfe2ea]",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 size-4 rounded-full bg-white transition-transform",
                    weekly ? "translate-x-4" : "translate-x-0.5",
                  )}
                />
              </button>
            </div>
          </SettingsGroup>
        </div>
      </div>
    </div>
  );
}
function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#e2e4ec] bg-white">
      <h2 className="border-b border-[#e5e7ef] px-3 py-3 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}
function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#e5e7ef] px-3 py-3 text-sm last:border-0">
      <span>{label}</span>
      <span className="text-xs text-[#77788a]">{value}</span>
    </div>
  );
}
