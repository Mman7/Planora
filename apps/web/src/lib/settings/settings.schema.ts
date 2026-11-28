import { z } from "zod";

export const profileSettingsSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or fewer")
    .transform((val) => val.trim()),
  email: z.string().email("Invalid email address"),
});

export const workspaceSettingsSchema = z.object({
  name: z
    .string()
    .min(1, "Workspace name is required")
    .max(100, "Workspace name must be 100 characters or fewer")
    .transform((val) => val.trim()),
  description: z
    .string()
    .max(500, "Description must be 500 characters or fewer")
    .nullable()
    .transform((val) => (val?.trim() === "" ? null : (val?.trim() ?? null))),
  defaultProjectView: z.enum(["GRID", "LIST"]),
  defaultTaskView: z.enum(["LIST", "BOARD"]),
});

export const workingTimeSettingsSchema = z
  .object({
    workingDays: z
      .array(z.number().min(0).max(6))
      .min(1, "Select at least one working day"),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
    breakEnabled: z.boolean(),
    breakStart: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Invalid time format")
      .nullable(),
    breakEnd: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Invalid time format")
      .nullable(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be later than start time",
    path: ["endTime"],
  })
  .refine(
    (data) => {
      if (!data.breakEnabled) return true;
      if (!data.breakStart || !data.breakEnd) return false;
      return data.breakEnd > data.breakStart;
    },
    { message: "Break end must be later than break start", path: ["breakEnd"] },
  )
  .refine(
    (data) => {
      if (!data.breakEnabled || !data.breakStart || !data.breakEnd) return true;
      return data.breakStart >= data.startTime && data.breakEnd <= data.endTime;
    },
    {
      message: "Break time must be within working hours",
      path: ["breakStart"],
    },
  );

export const calendarSettingsSchema = z.object({
  timezone: z.string().min(1, "Timezone is required"),
  startOfWeek: z.enum(["MONDAY", "SUNDAY", "SATURDAY"]),
  defaultView: z.enum(["MONTH", "WEEK", "DAY"]),
  showCompletedTasks: z.boolean(),
  showWeekends: z.boolean(),
  showMilestones: z.boolean(),
  showTaskStartDates: z.boolean(),
  showTaskDueDates: z.boolean(),
});

export const notificationSettingsSchema = z.object({
  dueDateRemindersEnabled: z.boolean(),
  reminderDaysBefore: z.array(z.number().min(0).max(30)),
  weeklySummaryEnabled: z.boolean(),
  weeklySummaryDay: z.number().min(0).max(6),
  weeklySummaryTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  inAppEnabled: z.boolean(),
  emailEnabled: z.boolean(),
});

export const settingsSchema = z.object({
  profile: profileSettingsSchema,
  workspace: workspaceSettingsSchema,
  workingTime: workingTimeSettingsSchema,
  calendar: calendarSettingsSchema,
  notifications: notificationSettingsSchema,
});
