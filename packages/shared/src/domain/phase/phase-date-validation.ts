import { validateDateRange, type DateValidationResult } from "../task/task-date-validation";

export function validatePhaseDateRange(
  startDate?: string | null,
  dueDate?: string | null,
): DateValidationResult {
  return validateDateRange(startDate, dueDate);
}
