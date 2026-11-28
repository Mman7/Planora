"use client";

import { useSettingsStore, type SettingsSection } from "@/lib/settings";
import { Input } from "@/components/ui/input";
import { SettingsGroup, SettingRow } from "../settings-view";

type SectionProps = {
  registerRef: (id: SettingsSection, el: HTMLElement | null) => void;
};

export function ProfileSettingsSection({ registerRef }: SectionProps) {
  const draft = useSettingsStore((s) => s.draft);
  const updateDraft = useSettingsStore((s) => s.updateDraft);

  if (!draft) return null;

  return (
    <SettingsGroup id="profile" title="Profile" registerRef={registerRef}>
      <SettingRow label="Name" htmlFor="settings-name">
        <Input
          id="settings-name"
          value={draft.profile.name}
          onChange={(e) => {
            updateDraft("profile", { name: e.target.value });
          }}
          className="max-w-60"
          maxLength={100}
          required
          aria-label="Display name"
        />
      </SettingRow>
      <SettingRow label="Email" htmlFor="settings-email">
        <Input
          id="settings-email"
          value={draft.profile.email}
          readOnly
          disabled
          className="max-w-60"
          aria-label="Email address"
        />
      </SettingRow>
    </SettingsGroup>
  );
}
