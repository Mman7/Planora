import type {
  AIProviderSettings,
  AIProviderType,
  CalendarSettings,
  NotificationSettings,
  ProfileSettings,
  Settings,
  WorkingTimeSettings,
  WorkspaceSettings,
} from "./settings.types";

export interface SettingsRepository {
  getSettings(): Promise<Settings>;
  updateProfile(input: Partial<ProfileSettings>): Promise<ProfileSettings>;
  updateWorkspace(input: Partial<WorkspaceSettings>): Promise<WorkspaceSettings>;
  updateWorkingTime(input: Partial<WorkingTimeSettings>): Promise<WorkingTimeSettings>;
  updateCalendar(input: Partial<CalendarSettings>): Promise<CalendarSettings>;
  updateNotifications(input: Partial<NotificationSettings>): Promise<NotificationSettings>;
  getAIProviderStatus(): Promise<AIProviderSettings>;
  connectAIProvider(provider: AIProviderType, apiKey: string): Promise<AIProviderSettings>;
  disconnectAIProvider(): Promise<AIProviderSettings>;
}

function getDetectedTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

function createDefaultSettings(name: string, email: string): Settings {
  return {
    profile: { name, email },
    workspace: {
      name: "My Workspace",
      description: null,
      defaultProjectView: "GRID",
      defaultTaskView: "LIST",
    },
    workingTime: {
      workingDays: [0, 1, 2, 3, 4],
      startTime: "09:00",
      endTime: "17:00",
      breakEnabled: false,
      breakStart: null,
      breakEnd: null,
    },
    calendar: {
      timezone: getDetectedTimezone(),
      startOfWeek: "MONDAY",
      defaultView: "MONTH",
      showCompletedTasks: true,
      showWeekends: true,
      showMilestones: true,
      showTaskStartDates: true,
      showTaskDueDates: true,
    },
    aiProvider: {
      provider: null,
      connectionStatus: "NOT_CONFIGURED",
    },
    notifications: {
      dueDateRemindersEnabled: true,
      reminderDaysBefore: [0, 1],
      weeklySummaryEnabled: true,
      weeklySummaryDay: 0,
      weeklySummaryTime: "09:00",
      inAppEnabled: true,
      emailEnabled: false,
    },
  };
}

async function simulateDelay(ms = 400): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function createMockSettingsRepository(
  userName: string,
  userEmail: string,
): SettingsRepository {
  let stored: Settings = createDefaultSettings(userName, userEmail);

  return {
    async getSettings() {
      await simulateDelay(300);
      return structuredClone(stored);
    },

    async updateProfile(input) {
      await simulateDelay();
      stored = { ...stored, profile: { ...stored.profile, ...input } };
      return structuredClone(stored.profile);
    },

    async updateWorkspace(input) {
      await simulateDelay();
      stored = { ...stored, workspace: { ...stored.workspace, ...input } };
      return structuredClone(stored.workspace);
    },

    async updateWorkingTime(input) {
      await simulateDelay();
      stored = { ...stored, workingTime: { ...stored.workingTime, ...input } };
      return structuredClone(stored.workingTime);
    },

    async updateCalendar(input) {
      await simulateDelay();
      stored = { ...stored, calendar: { ...stored.calendar, ...input } };
      return structuredClone(stored.calendar);
    },

    async updateNotifications(input) {
      await simulateDelay();
      stored = { ...stored, notifications: { ...stored.notifications, ...input } };
      return structuredClone(stored.notifications);
    },

    async getAIProviderStatus() {
      await simulateDelay(200);
      return structuredClone(stored.aiProvider);
    },

    async connectAIProvider(provider) {
      await simulateDelay(1200);
      stored = { ...stored, aiProvider: { provider, connectionStatus: "CONNECTED" } };
      return structuredClone(stored.aiProvider);
    },

    async disconnectAIProvider() {
      await simulateDelay(600);
      stored = { ...stored, aiProvider: { provider: null, connectionStatus: "NOT_CONFIGURED" } };
      return structuredClone(stored.aiProvider);
    },
  };
}
