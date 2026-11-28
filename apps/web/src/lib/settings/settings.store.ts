"use client";

import { create } from "zustand";
import type {
  AIProviderSettings,
  AIProviderType,
  Settings,
  SettingsSection,
} from "./settings.types";
import type { SettingsRepository } from "./settings.repository";

type SaveStatus = "idle" | "saving" | "success" | "error";

interface SettingsState {
  original: Settings | null;
  draft: Settings | null;
  loading: boolean;
  saveStatus: SaveStatus;
  saveError: string | null;
  activeSection: SettingsSection;
  aiProvider: AIProviderSettings | null;
  repository: SettingsRepository | null;

  setRepository: (repo: SettingsRepository) => void;
  setActiveSection: (section: SettingsSection) => void;
  loadSettings: () => Promise<void>;
  updateDraft: <K extends keyof Settings>(section: K, value: Partial<Settings[K]>) => void;
  isDirty: () => boolean;
  getDirtySections: () => (keyof Settings)[];
  saveChanges: () => Promise<void>;
  resetDraft: () => void;
  connectProvider: (provider: AIProviderType, apiKey: string) => Promise<void>;
  disconnectProvider: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  original: null,
  draft: null,
  loading: true,
  saveStatus: "idle",
  saveError: null,
  activeSection: "profile",
  aiProvider: null,
  repository: null,

  setRepository: (repo) => set({ repository: repo }),

  setActiveSection: (section) => set({ activeSection: section }),

  loadSettings: async () => {
    const { repository } = get();
    if (!repository) return;
    set({ loading: true });
    try {
      const settings = await repository.getSettings();
      const aiProvider = await repository.getAIProviderStatus();
      set({
        original: settings,
        draft: structuredClone(settings),
        aiProvider,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  updateDraft: (section, value) => {
    const { draft } = get();
    if (!draft) return;
    set({
      draft: { ...draft, [section]: { ...draft[section], ...value } },
      saveStatus: "idle",
      saveError: null,
    });
  },

  isDirty: () => {
    const { original, draft } = get();
    if (!original || !draft) return false;
    return JSON.stringify(original) !== JSON.stringify(draft);
  },

  getDirtySections: () => {
    const { original, draft } = get();
    if (!original || !draft) return [];
    const sections: (keyof Settings)[] = [
      "profile",
      "workspace",
      "workingTime",
      "calendar",
      "notifications",
    ];
    return sections.filter(
      (key) => JSON.stringify(original[key]) !== JSON.stringify(draft[key]),
    );
  },

  saveChanges: async () => {
    const { repository, draft, getDirtySections } = get();
    if (!repository || !draft) return;
    const dirty = getDirtySections();
    if (dirty.length === 0) return;

    set({ saveStatus: "saving", saveError: null });
    const errors: string[] = [];

    for (const section of dirty) {
      try {
        switch (section) {
          case "profile":
            await repository.updateProfile(draft.profile);
            break;
          case "workspace":
            await repository.updateWorkspace(draft.workspace);
            break;
          case "workingTime":
            await repository.updateWorkingTime(draft.workingTime);
            break;
          case "calendar":
            await repository.updateCalendar(draft.calendar);
            break;
          case "notifications":
            await repository.updateNotifications(draft.notifications);
            break;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        errors.push(`${section}: ${message}`);
      }
    }

    if (errors.length > 0) {
      set({ saveStatus: "error", saveError: errors.join("; ") });
    } else {
      set({
        original: structuredClone(draft),
        saveStatus: "success",
        saveError: null,
      });
      setTimeout(() => {
        const current = get();
        if (current.saveStatus === "success") {
          set({ saveStatus: "idle" });
        }
      }, 2000);
    }
  },

  resetDraft: () => {
    const { original } = get();
    if (!original) return;
    set({ draft: structuredClone(original), saveStatus: "idle", saveError: null });
  },

  connectProvider: async (provider, apiKey) => {
    const { repository } = get();
    if (!repository) return;
    set({ aiProvider: { provider, connectionStatus: "CHECKING" } });
    try {
      const result = await repository.connectAIProvider(provider, apiKey);
      set({ aiProvider: result });
    } catch {
      set({ aiProvider: { provider, connectionStatus: "FAILED" } });
    }
  },

  disconnectProvider: async () => {
    const { repository } = get();
    if (!repository) return;
    try {
      const result = await repository.disconnectAIProvider();
      set({ aiProvider: result });
    } catch {
      /* keep current state */
    }
  },
}));
