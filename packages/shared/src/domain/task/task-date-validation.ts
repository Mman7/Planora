export type DateValidationResult = {
  valid: boolean;
  error?: string;
};

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateOnly(value: string): boolean {
  if (!DATE_ONLY_REGEX.test(value)) {
    return false;
  }
  const [yearStr, monthStr, dayStr] = value.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

export function validateDateRange(
  startDate?: string | null,
  dueDate?: string | null,
): DateValidationResult {
  if (startDate && !isValidDateOnly(startDate)) {
    return { valid: false, error: "Start date must use YYYY-MM-DD format" };
  }
  if (dueDate && !isValidDateOnly(dueDate)) {
    return { valid: false, error: "Due date must use YYYY-MM-DD format" };
  }
  if (startDate && dueDate && startDate > dueDate) {
    return { valid: false, error: "Start date cannot be later than due date" };
  }
  return { valid: true };
}

export function isTaskOutsidePhaseDates(
  task: { startDate?: string | null; dueDate?: string | null },
  phase: { startDate?: string | null; dueDate?: string | null },
): boolean {
  const dates = [task.startDate, task.dueDate].filter((date): date is string => Boolean(date));
  return dates.some(
    (date) =>
      (Boolean(phase.startDate) && date < (phase.startDate ?? "")) ||
      (Boolean(phase.dueDate) && date > (phase.dueDate ?? "")),
  );
}
