import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  ReactGanttChart,
  type GanttHandle,
  type GanttScaleKey,
  type Task as GanttTask,
} from "@jaeungkim/gantt-chart";
import "@jaeungkim/gantt-chart/style.css";
import { TaskStatus } from "@repo/shared";
import { Button } from "@/components/ui/button";
import {
  getAllProjectTasks,
  type Phase,
  type Project,
  type Task,
  type UpdateTaskPayload,
} from "@/lib/planner-types";

const SCALE_OPTIONS: { key: GanttScaleKey; label: string }[] = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "quarter", label: "Quarter" },
];
const DEFAULT_SCALE: GanttScaleKey = "week";
const PHASE_ROW_PREFIX = "phase:";
const SCROLL_STEP_PX = 320;
const GANTT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

type ScheduledRange = { startDate: string; endDate: string };
type ScheduledTask = { task: Task; range: ScheduledRange };

async function persistGanttTaskDates(
  changedRows: GanttTask[],
  project: Project,
  onUpdateTask: (task: Task, input: UpdateTaskPayload) => Promise<void>,
) {
  const projectTasks = new Map(getAllProjectTasks(project).map((task) => [task.id, task]));
  await Promise.all(
    changedRows.flatMap((row) => {
      const task = projectTasks.get(row.id);
      if (!task || (task.startDate === row.startDate && task.dueDate === row.endDate)) {
        return [];
      }
      return [
        onUpdateTask(task, {
          startDate: getDateOnly(row.startDate),
          dueDate: getDateOnly(row.endDate),
        }),
      ];
    }),
  );
}

export function Timeline({
  project,
  onUpdateTask,
}: {
  project: Project;
  onUpdateTask: (task: Task, input: UpdateTaskPayload) => Promise<void>;
}) {
  const ganttRef = useRef<GanttHandle>(null);
  const [scale, setScale] = useState<GanttScaleKey>(DEFAULT_SCALE);
  const rows = useMemo(() => buildGanttTasks(project), [project]);
  const scheduledCount = rows.filter((row) => !row.id.startsWith(PHASE_ROW_PREFIX)).length;
  const unscheduledCount = getAllProjectTasks(project).length - scheduledCount;

  const scrollTimeline = (direction: -1 | 1) => {
    ganttRef.current
      ?.getScrollElement()
      ?.scrollBy({ left: direction * SCROLL_STEP_PX, behavior: "smooth" });
  };

  return (
    <div id="timeline">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Previous period"
            onClick={() => scrollTimeline(-1)}
          >
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="sm" onClick={() => ganttRef.current?.scrollToToday()}>
            Today
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Next period"
            onClick={() => scrollTimeline(1)}
          >
            <ChevronRight />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {SCALE_OPTIONS.map((option) => (
            <Button
              key={option.key}
              variant={scale === option.key ? "default" : "outline"}
              size="sm"
              onClick={() => ganttRef.current?.setScale(option.key)}
            >
              {option.label}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={() => ganttRef.current?.zoomToFit()}>
            Fit
          </Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-[#e2e4ec] bg-white">
        <ReactGanttChart
          ref={ganttRef}
          tasks={rows}
          height={480}
          width="100%"
          showTaskList
          hierarchy
          onTasksChange={(changedRows) => {
            void persistGanttTaskDates(changedRows, project, onUpdateTask);
          }}
          defaultScale={DEFAULT_SCALE}
          onScaleChange={setScale}
        />
      </div>
      <p className="mt-3 text-xs text-[#8b8c9d]">
        {unscheduledCount > 0
          ? `${String(unscheduledCount)} tasks without dates are not shown. `
          : ""}
        {project.dependencies.length} task dependencies tracked. Drag or resize task bars to update
        dates.
      </p>
    </div>
  );
}

function getDateOnly(value: string): string {
  return value.slice(0, 10);
}

function clampProgress(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function nonEmptyDate(value: string | null | undefined): string | null {
  return value === null || value === undefined || value === "" ? null : value;
}

function getRange(
  startDate: string | null | undefined,
  dueDate: string | null | undefined,
): ScheduledRange | null {
  const start = nonEmptyDate(startDate) ?? nonEmptyDate(dueDate);
  const end = nonEmptyDate(dueDate) ?? nonEmptyDate(startDate);
  if (!start || !end) {
    return null;
  }
  return start <= end ? { startDate: start, endDate: end } : { startDate: end, endDate: start };
}

function scheduleTasks(tasks: Task[]): ScheduledTask[] {
  return tasks.flatMap((task) => {
    const range = getRange(task.startDate, task.dueDate);
    return range ? [{ task, range }] : [];
  });
}

function getPhaseRange(phase: Phase, childRanges: ScheduledRange[]): ScheduledRange | null {
  const own = getRange(phase.startDate, phase.dueDate);
  if (own || childRanges.length === 0) {
    return own;
  }
  const starts = childRanges.map((range) => range.startDate).sort();
  const ends = childRanges.map((range) => range.endDate).sort();
  return { startDate: starts[0], endDate: ends[ends.length - 1] };
}

function getGanttColor(index: number, shade: "dark" | "light", status?: TaskStatus): string {
  const baseColor =
    status === TaskStatus.Completed ? "var(--success)" : GANTT_COLORS[index % GANTT_COLORS.length];
  const whiteMix = shade === "light" ? 42 : 0;
  const blackMix = shade === "dark" ? 28 : 0;
  const colorMix = String(100 - whiteMix - blackMix);
  return `color-mix(in oklch, ${baseColor} ${colorMix}%, ${shade === "dark" ? "black" : "white"})`;
}

function groupDependencies(
  dependencies: Project["dependencies"],
): Map<string, { targetId: string; type: "FS" }[]> {
  const grouped = new Map<string, { targetId: string; type: "FS" }[]>();
  for (const dependency of dependencies) {
    const list = grouped.get(dependency.taskId) ?? [];
    list.push({ targetId: dependency.dependsOnTaskId, type: "FS" });
    grouped.set(dependency.taskId, list);
  }
  return grouped;
}

function buildGanttTasks(project: Project): GanttTask[] {
  const dependencies = groupDependencies(project.dependencies);
  const rows: GanttTask[] = [];
  const addRow = (row: Omit<GanttTask, "sequence">) => {
    rows.push({ ...row, sequence: String(rows.length + 1).padStart(4, "0") });
  };
  const addTasks = (scheduled: ScheduledTask[], parentId: string | null, colorIndex: number) => {
    for (const { task, range } of scheduled) {
      addRow({
        id: task.id,
        name: task.name,
        startDate: range.startDate,
        endDate: range.endDate,
        parentId,
        progress: clampProgress(task.progress),
        color: getGanttColor(colorIndex, "light", task.status),
        dependencies: dependencies.get(task.id),
        allowMove: true,
        allowResize: true,
      });
    }
  };

  for (const [phaseIndex, phase] of project.phases.entries()) {
    const scheduled = scheduleTasks(phase.tasks);
    const range = getPhaseRange(
      phase,
      scheduled.map((item) => item.range),
    );
    const phaseRowId = `${PHASE_ROW_PREFIX}${phase.id}`;
    if (range) {
      addRow({
        id: phaseRowId,
        name: phase.name,
        ...range,
        parentId: null,
        progress: clampProgress(phase.progress),
        color: getGanttColor(phaseIndex, "dark"),
        readOnly: true,
      });
    }
    addTasks(scheduled, range ? phaseRowId : null, phaseIndex);
  }
  addTasks(scheduleTasks(project.unassignedTasks), null, project.phases.length);
  return rows;
}
