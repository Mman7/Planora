import { describe, expect, it } from "vitest";
import {
  PhaseStatus,
  TaskStatus,
  calculatePhaseProgress,
  calculatePhaseStatus,
  calculateProgress,
  calculateProjectProgress,
  hasCircularDependency,
  isTaskBlocked,
  isTaskOutsidePhaseDates,
  validateDateRange,
  validateProjectReassignmentDependencies,
  validateTaskDependency,
  type DomainPhase,
  type DomainTask,
  type TaskDependency,
} from "@repo/shared";

function makeTask(overrides: Partial<DomainTask> & { id: string }): DomainTask {
  return {
    projectId: "proj-1",
    phaseId: "phase-1",
    status: TaskStatus.Todo,
    startDate: null,
    dueDate: null,
    ...overrides,
  };
}

function makePhase(overrides: Partial<DomainPhase> & { id: string }): DomainPhase {
  return {
    projectId: "proj-1",
    startDate: null,
    dueDate: null,
    isOnHold: false,
    ...overrides,
  };
}

function makeDep(id: string, taskId: string, dependsOnTaskId: string): TaskDependency {
  return {
    id,
    taskId,
    dependsOnTaskId,
    createdAt: "2026-11-01T00:00:00.000Z",
  };
}

describe("Task & Project Progress", () => {
  it("returns 0 when there are no tasks", () => {
    expect(calculateProgress([])).toBe(0);
    expect(calculateProjectProgress([])).toBe(0);
  });

  it("returns 100 when all tasks are completed", () => {
    const tasks = [
      makeTask({ id: "t1", status: TaskStatus.Completed }),
      makeTask({ id: "t2", status: TaskStatus.Completed }),
    ];
    expect(calculateProgress(tasks)).toBe(100);
  });

  it("returns 0 when all tasks are TODO", () => {
    const tasks = [makeTask({ id: "t1" }), makeTask({ id: "t2" })];
    expect(calculateProgress(tasks)).toBe(0);
  });

  it("calculates rounded percentage for mixed completed and unfinished tasks", () => {
    const tasks = [
      makeTask({ id: "t1", status: TaskStatus.Completed }),
      makeTask({ id: "t2", status: TaskStatus.InProgress }),
      makeTask({ id: "t3", status: TaskStatus.InReview }),
    ];
    expect(calculateProgress(tasks)).toBe(33);
  });

  it("excludes cancelled tasks from the denominator", () => {
    const tasks = [
      makeTask({ id: "t1", status: TaskStatus.Completed }),
      makeTask({ id: "t2", status: TaskStatus.Todo }),
      makeTask({ id: "t3", status: TaskStatus.Cancelled }),
    ];
    expect(calculateProgress(tasks)).toBe(50);
  });

  it("returns 0 when all tasks are cancelled", () => {
    const tasks = [
      makeTask({ id: "t1", status: TaskStatus.Cancelled }),
      makeTask({ id: "t2", status: TaskStatus.Cancelled }),
    ];
    expect(calculateProgress(tasks)).toBe(0);
  });
});

describe("Phase Status & Progress", () => {
  const phase = makePhase({ id: "phase-1" });

  it("returns NOT_STARTED for empty phase", () => {
    expect(calculatePhaseStatus(phase, [])).toBe(PhaseStatus.NotStarted);
    expect(calculatePhaseProgress("phase-1", [])).toBe(0);
  });

  it("returns NOT_STARTED when all tasks are TODO", () => {
    const tasks = [makeTask({ id: "t1" }), makeTask({ id: "t2" })];
    expect(calculatePhaseStatus(phase, tasks)).toBe(PhaseStatus.NotStarted);
  });

  it("returns IN_PROGRESS when at least one task is IN_PROGRESS", () => {
    const tasks = [
      makeTask({ id: "t1", status: TaskStatus.Todo }),
      makeTask({ id: "t2", status: TaskStatus.InProgress }),
    ];
    expect(calculatePhaseStatus(phase, tasks)).toBe(PhaseStatus.InProgress);
  });

  it("returns IN_PROGRESS when at least one task is IN_REVIEW", () => {
    const tasks = [
      makeTask({ id: "t1", status: TaskStatus.Todo }),
      makeTask({ id: "t2", status: TaskStatus.InReview }),
    ];
    expect(calculatePhaseStatus(phase, tasks)).toBe(PhaseStatus.InProgress);
  });

  it("returns IN_PROGRESS for mixed completed and unfinished tasks", () => {
    const tasks = [
      makeTask({ id: "t1", status: TaskStatus.Completed }),
      makeTask({ id: "t2", status: TaskStatus.Todo }),
    ];
    expect(calculatePhaseStatus(phase, tasks)).toBe(PhaseStatus.InProgress);
    expect(calculatePhaseProgress("phase-1", tasks)).toBe(50);
  });

  it("returns COMPLETED when all eligible tasks are completed", () => {
    const tasks = [
      makeTask({ id: "t1", status: TaskStatus.Completed }),
      makeTask({ id: "t2", status: TaskStatus.Cancelled }),
    ];
    expect(calculatePhaseStatus(phase, tasks)).toBe(PhaseStatus.Completed);
    expect(calculatePhaseProgress("phase-1", tasks)).toBe(100);
  });

  it("returns NOT_STARTED when all tasks in phase are cancelled", () => {
    const tasks = [makeTask({ id: "t1", status: TaskStatus.Cancelled })];
    expect(calculatePhaseStatus(phase, tasks)).toBe(PhaseStatus.NotStarted);
    expect(calculatePhaseProgress("phase-1", tasks)).toBe(0);
  });

  it("overrides computed status with ON_HOLD and resumes cleanly", () => {
    const onHoldPhase = makePhase({ id: "phase-1", isOnHold: true });
    const tasks = [makeTask({ id: "t1", status: TaskStatus.Completed })];
    expect(calculatePhaseStatus(onHoldPhase, tasks)).toBe(PhaseStatus.OnHold);

    const resumedPhase = { ...onHoldPhase, isOnHold: false };
    expect(calculatePhaseStatus(resumedPhase, tasks)).toBe(PhaseStatus.Completed);
  });

  it("recalculates phase progress when tasks move in and out", () => {
    const t1 = makeTask({ id: "t1", phaseId: "phase-1", status: TaskStatus.Completed });
    const t2 = makeTask({ id: "t2", phaseId: "phase-2", status: TaskStatus.Todo });
    expect(calculatePhaseProgress("phase-1", [t1, t2])).toBe(100);

    const movedIn = { ...t2, phaseId: "phase-1" };
    expect(calculatePhaseProgress("phase-1", [t1, movedIn])).toBe(50);

    const movedOut = { ...t1, phaseId: null };
    expect(calculatePhaseProgress("phase-1", [movedOut, movedIn])).toBe(0);
  });
});

describe("Task & Phase Date Validation", () => {
  it("allows no dates, only startDate, only dueDate, and valid range", () => {
    expect(validateDateRange(null, null).valid).toBe(true);
    expect(validateDateRange("2026-11-01", null).valid).toBe(true);
    expect(validateDateRange(null, "2026-11-10").valid).toBe(true);
    expect(validateDateRange("2026-11-01", "2026-11-10").valid).toBe(true);
    expect(validateDateRange("2026-11-01", "2026-11-01").valid).toBe(true);
  });

  it("rejects startDate later than dueDate", () => {
    const result = validateDateRange("2026-11-15", "2026-11-10");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Start date cannot be later than due date");
  });

  it("rejects invalid date-only format", () => {
    expect(validateDateRange("2026-13-01", null).valid).toBe(false);
    expect(validateDateRange("11/01/2026", null).valid).toBe(false);
  });

  it("detects when task dates fall outside phase date range", () => {
    const phase = { startDate: "2026-11-05", dueDate: "2026-11-20" };
    expect(isTaskOutsidePhaseDates({ startDate: "2026-11-05", dueDate: "2026-11-20" }, phase)).toBe(
      false,
    );
    expect(isTaskOutsidePhaseDates({ startDate: "2026-11-01", dueDate: "2026-11-10" }, phase)).toBe(
      true,
    );
    expect(isTaskOutsidePhaseDates({ startDate: "2026-11-10", dueDate: "2026-11-25" }, phase)).toBe(
      true,
    );
    expect(isTaskOutsidePhaseDates({ startDate: null, dueDate: null }, phase)).toBe(false);
  });
});

describe("Task Dependencies & Blocked State", () => {
  const t1 = makeTask({ id: "t1", projectId: "proj-1", status: TaskStatus.Todo });
  const t2 = makeTask({ id: "t2", projectId: "proj-1", status: TaskStatus.InProgress });
  const t3 = makeTask({ id: "t3", projectId: "proj-1", status: TaskStatus.Completed });
  const otherProjTask = makeTask({ id: "t4", projectId: "proj-2" });
  const allTasks = [t1, t2, t3, otherProjTask];

  it("allows valid same-project dependency", () => {
    const result = validateTaskDependency({
      taskId: "t1",
      dependsOnTaskId: "t2",
      tasks: allTasks,
      existingDependencies: [],
    });
    expect(result.valid).toBe(true);
  });

  it("rejects self-dependency", () => {
    const result = validateTaskDependency({
      taskId: "t1",
      dependsOnTaskId: "t1",
      tasks: allTasks,
      existingDependencies: [],
    });
    expect(result.valid).toBe(false);
    expect(result.code).toBe("SELF_DEPENDENCY");
  });

  it("rejects duplicate dependency", () => {
    const result = validateTaskDependency({
      taskId: "t1",
      dependsOnTaskId: "t2",
      tasks: allTasks,
      existingDependencies: [makeDep("d1", "t1", "t2")],
    });
    expect(result.valid).toBe(false);
    expect(result.code).toBe("DUPLICATE_DEPENDENCY");
  });

  it("rejects cross-project dependency", () => {
    const result = validateTaskDependency({
      taskId: "t1",
      dependsOnTaskId: "t4",
      tasks: allTasks,
      existingDependencies: [],
    });
    expect(result.valid).toBe(false);
    expect(result.code).toBe("CROSS_PROJECT_DEPENDENCY");
  });

  it("rejects direct circular dependency", () => {
    const existing = [makeDep("d1", "t1", "t2")];
    const result = validateTaskDependency({
      taskId: "t2",
      dependsOnTaskId: "t1",
      tasks: allTasks,
      existingDependencies: existing,
    });
    expect(result.valid).toBe(false);
    expect(result.code).toBe("CIRCULAR_DEPENDENCY");
  });

  it("rejects indirect circular dependency", () => {
    const existing = [makeDep("d1", "t1", "t2"), makeDep("d2", "t2", "t3")];
    expect(hasCircularDependency("t3", "t1", existing)).toBe(true);
    const result = validateTaskDependency({
      taskId: "t3",
      dependsOnTaskId: "t1",
      tasks: allTasks,
      existingDependencies: existing,
    });
    expect(result.valid).toBe(false);
    expect(result.code).toBe("CIRCULAR_DEPENDENCY");
  });

  it("validates dependencies when reassigning a task to another project", () => {
    const deps = [makeDep("d1", "t1", "t2")];
    const res = validateProjectReassignmentDependencies("t1", "proj-2", allTasks, deps);
    expect(res.valid).toBe(false);
    expect(res.conflictingTaskIds).toEqual(["t2"]);
  });

  it("computes blocked state and unblocks when prerequisites complete", () => {
    const deps = [makeDep("d1", "t1", "t2")];
    expect(isTaskBlocked(t1, deps, [t1, t2])).toBe(true);

    const completedT2 = { ...t2, status: TaskStatus.Completed };
    expect(isTaskBlocked(t1, deps, [t1, completedT2])).toBe(false);
  });
});
