export interface ProfileSettings {
  name: string;
  email: string;
}

export interface WorkspaceSettings {
  name: string;
  description: string | null;
  defaultProjectView: "GRID" | "LIST";
  defaultTaskView: "LIST" | "BOARD";
}

export interface WorkingTimeSettings {
  workingDays: number[];
  startTime: string;
  endTime: string;
  breakEnabled: boolean;
  breakStart: string | null;
  breakEnd: string | null;
}

export interface CalendarSettings {
  timezone: string;
  startOfWeek: "MONDAY" | "SUNDAY" | "SATURDAY";
  defaultView: "MONTH" | "WEEK" | "DAY";
  showCompletedTasks: boolean;
  showWeekends: boolean;
  showMilestones: boolean;
  showTaskStartDates: boolean;
  showTaskDueDates: boolean;
}

export type AIProviderType = "ANTHROPIC" | "GOOGLE" | "OPENAI";

export type AIConnectionStatus =
  | "NOT_CONFIGURED"
  | "CONNECTED"
  | "INVALID"
  | "FAILED"
  | "CHECKING";

export interface AIProviderSettings {
  provider: AIProviderType | null;
  connectionStatus: AIConnectionStatus;
}

export interface NotificationSettings {
  dueDateRemindersEnabled: boolean;
  reminderDaysBefore: number[];
  weeklySummaryEnabled: boolean;
  weeklySummaryDay: number;
  weeklySummaryTime: string;
  inAppEnabled: boolean;
  emailEnabled: boolean;
}

export interface Settings {
  profile: ProfileSettings;
  workspace: WorkspaceSettings;
  workingTime: WorkingTimeSettings;
  calendar: CalendarSettings;
  aiProvider: AIProviderSettings;
  notifications: NotificationSettings;
}

export type SettingsSection =
  | "profile"
  | "workspace"
  | "working-time"
  | "calendar"
  | "ai-provider"
  | "notifications"
  | "account";

export const SETTINGS_SECTIONS: { id: SettingsSection; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "workspace", label: "Workspace" },
  { id: "working-time", label: "Working time" },
  { id: "calendar", label: "Calendar" },
  { id: "ai-provider", label: "AI provider" },
  { id: "notifications", label: "Notifications" },
  { id: "account", label: "Account" },
];

export const WEEKDAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const AI_PROVIDERS: {
  id: AIProviderType;
  name: string;
  available: boolean;
}[] = [
  { id: "ANTHROPIC", name: "Anthropic Claude", available: true },
  { id: "GOOGLE", name: "Google Gemini", available: true },
  { id: "OPENAI", name: "OpenAI", available: true },
];

export const REMINDER_OPTIONS = [
  { value: 0, label: "On the due date" },
  { value: 1, label: "1 day before" },
  { value: 3, label: "3 days before" },
  { value: 7, label: "7 days before" },
] as const;
